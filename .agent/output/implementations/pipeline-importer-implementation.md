# User's Intent

The user requested the implementation of the robust, zero-downtime IMDB importing pipeline. The pipeline should follow the approved stages:
1. **Prepare Phase:**
   - Truncating/wiping staging tables.
   - Dropping staging table indexes to optimize bulk insert speed.
   - Downloading dataset files and streaming them into staging tables via PostgreSQL `COPY`.
   - Re-building staging table indexes.
2. **Transform Phase:**
   - Performing an atomic, transactional table and index rename swap.

All implementation code should compile, be robust against failures, and propagate exceptions cleanly.

---

# Results

We have completed the implementation of the refined pipeline.

### 1. Database Migrations
* Created [V4__create_imdb_staging_and_indexes.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db/migration/V4__create_imdb_staging_and_indexes.sql) to define the staging tables (`imdb.movie_staging`, `imdb.person_staging`, etc.) matching the structures in `V1` exactly.
* Configured the initial active indexes and their staging equivalents in `V4` so both sets of tables start with identical index geometries.

### 2. Service Refactoring & Creation
* **Staging Table Wiping:** Updated [ImdbWiperService.java](file:///s:/Coding/Projects/film-db/modules/importer/src/main/java/dev/sonle/filmdb/importer/service/ImdbWiperService.java) to rename `wipeData()` to `wipeStagingData()`, targeting the `_staging` tables exclusively.
* **Index Management:** Created [ImdbIndexService.java](file:///s:/Coding/Projects/film-db/modules/importer/src/main/java/dev/sonle/filmdb/importer/service/ImdbIndexService.java) to handle dynamically dropping and recreating the 5 secondary indexes on the staging tables.
* **Ingestion and Rename Swapping:** Refactored [ImdbImportService.java](file:///s:/Coding/Projects/film-db/modules/importer/src/main/java/dev/sonle/filmdb/importer/service/ImdbImportService.java) to direct `COPY` commands to the `_staging` tables. Added the `swapStagingWithActive()` method, which performs the table and index rename swap atomically in a single rollback-safe JDBC transaction.
* **Error Propagation:** Replaced swallowed try-catches in `ImdbImportService` with explicit `AppException` propagation so that ingestion errors fail the pipeline visibly and cancel the swap.

### 3. Orchestration Refactoring
* Updated [ImdbDatasetPipeline.java](file:///s:/Coding/Projects/film-db/modules/importer/src/main/java/dev/sonle/filmdb/importer/pipeline/ImdbDatasetPipeline.java) to coordinate the steps sequentially:
  1. Wipe staging tables.
  2. Drop staging indexes.
  3. Parallel download datasets.
  4. Parallel import into staging tables.
  5. Re-build staging indexes.
  6. Execute atomic table/index rename swap.
  7. Trigger application cache eviction (hook).
