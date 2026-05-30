# Implementation: Optimistic Locking for PendingRequest

## User's intent
The user wants to implement optimistic locking on the `PendingRequest` entity in the admin domain as proposed in the analysis, to prevent concurrent modification conflicts when administrators approve/reject requests simultaneously.

## Results
We successfully implemented optimistic locking for the `PendingRequest` entity. Below is a summary of the modifications:

1. **Database Migration Script:**
   - Created [V7__add_version_to_pending_request.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db/migration/V7__add_version_to_pending_request.sql) to add a `version` column to the `admin.pending_request` table.

2. **Entity Modification:**
   - Modified [PendingRequest.java](file:///s:/Coding/Projects/film-db/modules/admin/src/main/java/dev/sonle/filmdb/admin/model/PendingRequest.java) to include the `@Version` annotation on a new `version` field.

3. **Exception Handler & Error Codes:**
   - Added a new `CONCURRENT_UPDATE` enum value to [AppExceptionCode.java](file:///s:/Coding/Projects/film-db/modules/shared/src/main/java/dev/sonle/filmdb/shared/exception/AppExceptionCode.java) representing a database conflict.
   - Updated [GlobalExceptionHandler.java](file:///s:/Coding/Projects/film-db/modules/shared/src/main/java/dev/sonle/filmdb/shared/exception/GlobalExceptionHandler.java) to catch `OptimisticLockingFailureException` and map it to `CONCURRENT_UPDATE` (returning a `409 Conflict` HTTP status with a clear warning message).
