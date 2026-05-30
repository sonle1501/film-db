# IMDB Import Pipeline Optimization Plan (Revised)

This revised plan incorporates recommendations to solve database write race conditions, $O(N^2)$ scaling issues, and transaction commit race conditions by introducing a normalized log entity and transactional event listeners.

## User's intent

The user wants to refactor and optimize the progress reporting flow in [ImdbDatasetPipeline.java](file:///s:/Coding/Projects/film-db/modules/importer/src/main/java/dev/sonle/filmdb/importer/pipeline/ImdbDatasetPipeline.java) and [ImportJobEventListener.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/listener/ImportJobEventListener.java) incorporating recommendations from another agent's critique.

---

## Results

### Proposed Architectural Redesign

Instead of throttling writes to a growing JSONB column, we will decouple the log data from the main job history record and use transactional events for downstream listeners:

1. **Table Normalization for Logs ($O(1)$ updates):** Move the `logs` list from the `import_job_history` entity/table to a dedicated `import_job_log` table. Each progress event message is stored as a new log line row via a simple SQL `INSERT`.
2. **Atomic Progress Updates:** Modify the progress/stage status of the import job via a direct `@Modifying` query in Spring Data JPA. This avoids the Read-Modify-Write cycle on the main entity.
3. **Downstream Lifecycle Safety:** Replace standard `@EventListener` on critical lifecycle completion events (like `ImdbDataImportedEvent`) with `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`.

#### Options & Trade-offs Analysis

| Dimension | Option A: Throttling JSONB (Old Plan) | Option B: Log Table Normalization (New Plan - Recommended) |
| :--- | :--- | :--- |
| **Write Overhead** | High ($O(N^2)$ serialization and network scaling) | Extremely Low ($O(1)$ insertion of logs + simple atomic status updates) |
| **Concurrency Safety** | Low (Vulnerable to dirty reads / updates) | 100% Safe (Concurrent inserts do not clash) |
| **Schema Changes** | None | Requires adding `import_job_log` table and dropping `logs` JSONB column |

---

### Proposed Changes

#### Database Migrations
##### [NEW] [V6__normalize_import_job_logs.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db/migration/V6__normalize_import_job_logs.sql)
* Create `admin.import_job_log` table.
* Drop the `logs` column from the `admin.import_job_history` table.

#### Backend Entities
##### [NEW] [ImportJobLog.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/model/ImportJobLog.java)
* Map to the new `admin.import_job_log` table, containing fields: `id`, `jobId`, `message`, `timestamp`.

##### [MODIFY] [ImportJobHistory.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/model/ImportJobHistory.java)
* Remove the `logs` JSONB list property.
* Add `@OneToMany` lazy-loaded relationship to `ImportJobLog` to support REST status serialization in the dashboard controller.

#### Repositories
##### [NEW] [ImportJobLogRepository.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/repository/ImportJobLogRepository.java)
* Spring Data JPA interface for log CRUD operations.

##### [MODIFY] [ImportJobHistoryRepository.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/repository/ImportJobHistoryRepository.java)
* Add a parameterized custom update method annotated with `@Modifying` and `@Query` to perform single-row updates on status, stage, progress, and error message.

#### Event Handling
##### [MODIFY] [ImportJobEventListener.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/listener/ImportJobEventListener.java)
* Process events asynchronously using `@Async`.
* Insert log entries directly to `ImportJobLogRepository` and execute atomic job updates via `ImportJobHistoryRepository`.

##### [MODIFY] [SearchRefreshListener.java](file:///s:/Coding/Projects/film-db/modules/search/src/main/java/dev/sonle/filmdb/search/listener/SearchRefreshListener.java)
* Update `handleImdbDataImported` event listener to `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)` to avoid any transaction timing or commit races.

---

## Proposed Roadmap

1. **Step 1:** Create Flyway migration script `V6` to create the new `import_job_log` table and clean up `import_job_history`.
2. **Step 2:** Write `ImportJobLog` and `ImportJobLogRepository` classes.
3. **Step 3:** Refactor `ImportJobHistory` and `ImportJobHistoryRepository` with updated mapping and modification queries.
4. **Step 4:** Refactor `ImportJobEventListener` to write entries to the new log entity asynchronously.
5. **Step 5:** Modify downstream listeners like `SearchRefreshListener` to use transactional events.
