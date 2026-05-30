# User's intent
The user requested to modify the HTTP Status codes for correctness in `BusinessExceptionCode` and `AppExceptionCode`, and ensure that only placeholders (i.e. standardized uppercase snake-case keys matching the enum names) are used for their default messages.

# Results
The following modifications were implemented in the exception modules:

1. **`BusinessExceptionCode` corrections**:
   - Updated `INVALID_INPUT` to return `HttpStatus.BAD_REQUEST` (400) instead of `HttpStatus.CONFLICT` (409).
   - Updated `ITEM_NOT_VALID` to return `HttpStatus.BAD_REQUEST` (400) instead of `HttpStatus.NOT_FOUND` (404).
   - Replaced natural language default messages with their corresponding uppercase snake-case string placeholders (e.g. `"MOVIE_NOT_FOUND"`, `"UNAUTHORIZED_ACCESS"`, etc.) for all enums.

2. **`AppExceptionCode` corrections**:
   - Updated `IMDB_SERVER_EXCEPTION` to return `HttpStatus.BAD_GATEWAY` (502) instead of `HttpStatus.NOT_FOUND` (404).
   - Replaced natural language default messages with their corresponding uppercase snake-case string placeholders (e.g. `"IMPORT_TASK_ERROR"`, `"UNAUTHORIZED"`, etc.) for all enums.
