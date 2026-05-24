# User's Intent

The user wants to plan improvements for the IMDB dataset importing pipeline in the `film-db` project. Specifically, they are asking:
1. **Pipeline Failures:** What happens if the import pipeline fails during execution?
2. **Backup/Switch Strategy:** Should there be a backup mechanism in place, and only use the new data when the import is fully successful?
3. **Pipeline Review:** An assessment of the current pipeline implementation and recommendations for improvement.

The plan should be saved to `.agent/output/plans/pipeline-importer-plan.md`.

---

# Results

## 1. Analysis of the Current Pipeline

### Failure Scenario & Consequences
Under the current codebase:
* **Immediate Truncation:** The `ImdbDatasetPipeline` calls `dataWiper.wipeData()` (which runs `TRUNCATE TABLE ...` on all main tables) *before* downloading the new datasets or starting the imports. If a network download fails or a parsing error occurs mid-stream, the database is left completely empty or partially populated.
* **Swallowed Exceptions:** In `ImdbImportService.importData`, exceptions during the `COPY` operations are caught, logged, and **suppressed** (the method just returns `void` without throwing). Thus, `CompletableFuture.allOf(...).join()` completes successfully even if all table imports fail. The admin receives a "IMDB pipeline has finished" message, while the database is actually broken.
* **Synchronous Blocking:** The `/api/admin/import-pipeline` controller endpoint triggers the pipeline synchronously on a web servlet container thread. Because downloading and copying gigabytes of IMDB datasets takes minutes, this request will inevitably cause HTTP client timeouts, pin thread resources, and prevent progressive feedback.

---

## 2. Proposed Backup & Swap Strategies (Trade-off Analysis)

To ensure the system never serves broken/partial data, we must run imports in a staging environment and only switch to the new data upon total success.

### Approach A: Staging Tables with Atomic Rename Swap (Recommended)
We create a parallel set of "staging" tables in the same `imdb` schema (e.g., `movie_staging`, `person_staging`, etc.) with the exact same definitions.

* **Execution Flow:**
  1. Truncate staging tables: `TRUNCATE TABLE imdb.movie_staging, imdb.person_staging, ...`
  2. Download datasets.
  3. Execute PostgreSQL `COPY` commands into the staging tables in parallel.
  4. If any task fails, propagate the exception, mark the job as failed, and **leave the main tables untouched**.
  5. If all staging imports succeed, execute an atomic swap in a single transaction:
     ```sql
     BEGIN;
     -- Rename main tables to temporary names
     ALTER TABLE imdb.movie RENAME TO movie_old;
     ALTER TABLE imdb.person RENAME TO person_old;
     -- ... for all 7 tables
     
     -- Rename staging tables to main table names
     ALTER TABLE imdb.movie_staging RENAME TO movie;
     ALTER TABLE imdb.person_staging RENAME TO person;
     -- ... for all 7 tables
     
     -- Rename old main tables to staging names (ready for the next import)
     ALTER TABLE imdb.movie_old RENAME TO movie_staging;
     ALTER TABLE imdb.person_old RENAME TO person_staging;
     -- ... for all 7 tables
     COMMIT;
     ```

* **Pros:**
  * **Zero Downtime:** Table renames in PostgreSQL only modify system catalog metadata. The swap finishes in milliseconds. Readers of `imdb.movie` will experience virtually zero disruption.
  * **100% Robust:** The main tables are never modified during the download/import phase. If a failure occurs at 99%, the application is unaffected.
  * **No Storage Overhead at Rest:** Staging tables can remain empty (or hold the previous dataset) between runs.
  * **Flyway Compatibility:** Doesn't affect Flyway migrations because the `flyway_schema_history` table is left completely intact.

* **Cons:**
  * Requires maintaining staging table definitions in Flyway migrations (e.g., `V4__init_imdb_staging_tables.sql`).
  * Index and constraint names (e.g., `movie_pkey` vs `movie_staging_pkey`) alternate names on each swap. (This is harmless as Hibernate and JPA query tables by table name and do not care about index names).

---

### Approach B: Schema-Level Swap (`imdb` <-> `imdb_staging`)
Create a secondary schema called `imdb_staging`. Import the data there, then swap the schemas:
```sql
BEGIN;
DROP SCHEMA IF EXISTS imdb_old CASCADE;
ALTER SCHEMA imdb RENAME TO imdb_old;
ALTER SCHEMA imdb_staging RENAME TO imdb;
ALTER SCHEMA imdb_old RENAME TO imdb_staging;
COMMIT;
```

* **Pros:**
  * Avoids creating duplicate table names (like `*_staging`) in the same schema.

* **Cons:**
  * **Flyway Migration Conflict:** The database migrations specify `spring.flyway.schemas: imdb,users`. By default, Flyway creates `flyway_schema_history` inside the first schema (`imdb`). Swapping schemas means we swap or lose the history table, which corrupts Flyway's state on subsequent boot-ups.
  * **Active Connection Cache Issues:** Renaming schemas under active connection pools (HikariCP) and JPA entity manager configurations can lead to caching anomalies or query failures unless the application is restarted.

---

### Recommended Approach
We strongly recommend **Approach A (Staging Tables with Atomic Rename Swap)**. It is extremely reliable, compatible with Flyway, has zero downtime, and handles exceptions cleanly.

---

## 3. Review of the Current Pipeline

| Aspect | Current Status | Review & Recommendation |
| :--- | :--- | :--- |
| **Concurrency** | Parallel download & parallel import | **Good.** Speeds up processing significantly. Keep using `CompletableFuture`. |
| **Data Ingestion** | PostgreSQL `COPY FROM STDIN` via JDBC | **Excellent.** This is the fastest way to stream TSV data into PostgreSQL. |
| **Download Safety** | Writes to `.tmp` files first, then atomic move | **Excellent.** Prevents partially downloaded file corruption. |
| **Error Handling** | Swallows exceptions inside `ImdbImportService` | **Critical Issue.** Re-throw exceptions inside `importData` so that `CompletableFuture.allOf(...).join()` can detect failures. |
| **Execution Mode** | Blocks HTTP servlet thread in controller | **Major Bottleneck.** Make it asynchronous. Use Spring's `@Async` or a dedicated thread pool. Return `202 Accepted` with a `jobId`. |
| **Job Monitoring** | None (wasted JPA Entity/Repository) | **Missing Feature.** Integrate the `ImportJobHistory` table. Update status to `RUNNING` at start, `SUCCESS` on finish, and `FAILED` with error messages on exception. |
| **Thread Management** | Instantiates a new thread pool on every request | **Inefficient.** Instantiate a single bean `ThreadPoolTaskExecutor` in a configuration class and reuse it. |

---

## 4. Implementation Steps (Roadmap)

To implement the recommended design, we will proceed with the following tasks:

### Task 1: Create Staging Tables in Database
* Write a new Flyway migration `V4__create_imdb_staging_tables.sql` to define:
  * `imdb.movie_staging`
  * `imdb.person_staging`
  * `imdb.movie_alternative_staging`
  * `imdb.movie_crew_staging`
  * `imdb.movie_episode_staging`
  * `imdb.movie_principal_staging`
  * `imdb.movie_rating_staging`
* Ensure their schemas match `V1` exactly.

### Task 2: Make Pipeline Asynchronous & Track Status
* In `ImportController.java`, change the return type to return a `JobIdResponse` (HTTP 202 Accepted) immediately.
* Configure a thread executor bean (e.g. `imdbImportExecutor`) to limit concurrency safely and avoid thread starvation.
* Save a new `ImportJobHistory` record at the start of `runPipeline` with status `RUNNING`.

### Task 3: Improve Error Handling & Re-throw Exceptions
* Modify `ImdbImportService.java` to let database exception propagate.
* In the pipeline catcher, if any exception occurs:
  * Update the `ImportJobHistory` status to `FAILED`.
  * Set `error_message` in history.
  * Log the error and clean up.
* Do not perform the table swap if any step fails.

### Task 4: Implement the Atomic Rename Swap
* Add a transactional method in the service or repository layer to execute the SQL swap command.
* On successful import of all staging tables, call this method.
* Finally, set `ImportJobHistory` status to `SUCCESSFUL`.
* Implement a Status Polling Endpoint (`/api/admin/import-pipeline/status/{jobId}`) so the admin dashboard can show live progress.
