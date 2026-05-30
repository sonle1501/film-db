# IMDB Import Pipeline Optimization Implementation

This document outlines the changes implemented to optimize the progress logging and transaction synchronization inside the IMDB Ingest Pipeline.

## User's intent

The user wants to resolve concurrent database locking, transaction race conditions, and $O(N^2)$ scale-bound JSONB array update issues in the IMDB import pipeline.

---

## Results

### Key Implementations

1. **Table Normalization for Logs ($O(1)$ scaling):**
   * Dropped the JSONB `logs` column from the `admin.import_job_history` table.
   * Created a new table `admin.import_job_log` to store log lines.
   * Persisted log messages as individual SQL `INSERT` rows. This keeps the database log writing fast, sequential, and safe from parallel update overrides.
2. **Atomic In-Place Status Updates:**
   * Replaced entity-based Read-Modify-Write saves with a direct, parameterized SQL `UPDATE` statement in `ImportJobHistoryRepository.updateJobStatus(...)` to modify progress and stage metadata atomically.
3. **API Contract Compatibility:**
   * Kept the REST API backward-compatible with the Next.js frontend by using a custom Jackson property resolver (`getLogs()`) in `ImportJobHistory` that dynamically transforms the lazy `@OneToMany` entity log list back into a plain array of strings (`logs: string[]`).
4. **Transaction Lifecycle Safety:**
   * Refactored `ImportService` to defer launching the pipeline thread until the transaction creating the status row has fully committed.
   * Modified `SearchRefreshListener` to subscribe to completion events via `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)`, ensuring that search materialized views are only refreshed after the active staging database tables have swapped.

---

### Files Modified and Added

* **[NEW] [V8__normalize_import_job_logs.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db/migration/V8__normalize_import_job_logs.sql):** Database migration.
* **[NEW] [ImportJobLog.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/model/ImportJobLog.java):** Model mapping for logs.
* **[NEW] [ImportJobLogRepository.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/repository/ImportJobLogRepository.java):** Database repository for job logs.
* **[MODIFY] [ImportJobHistory.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/model/ImportJobHistory.java):** Relationship refactoring.
* **[MODIFY] [ImportJobHistoryRepository.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/repository/ImportJobHistoryRepository.java):** Atomic Status updates.
* **[MODIFY] [ImportJobEventListener.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/listener/ImportJobEventListener.java):** Asynchronous log row inserting.
* **[MODIFY] [ImportService.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/service/ImportService.java):** Synchronization-deferred pipeline execution.
* **[MODIFY] [SearchRefreshListener.java](file:///s:/Coding/Projects/film-db/modules/search/src/main/java/dev/sonle/filmdb/search/listener/SearchRefreshListener.java):** Transactional listener bindings.
