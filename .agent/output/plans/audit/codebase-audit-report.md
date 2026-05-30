# Codebase Audit & Refactoring Plan

## User's Intent
The user requested a comprehensive scan and analysis of the entire codebase (frontend and backend) to identify areas that require refactoring, enhancement, or fixing based on software engineering best practices.

## Results & Analysis

### 1. Frontend: TypeScript & Type Safety
- **Issue:** Widespread usage of `any` types. Files like `api-client.ts` and various components/pages (`AddToListModal.tsx`, `movies/page.tsx`, `genres/page.tsx`) rely heavily on `any` for API responses, state (`useState<any>`), and error handling (`catch (err: any)`).
- **Impact:** Defeats the purpose of TypeScript, leading to potential runtime errors, unhandled edge cases, and poor developer experience (no intellisense).
- **Refactoring Action:** 
  - Define explicit interfaces/types for all API responses mapping to the backend DTOs.
  - Refactor `catch (err: any)` to `catch (error: unknown)` and use type guards (e.g., `if (error instanceof Error)`) or utility functions to safely extract error messages.

### 2. Frontend: Next.js Component Architecture
- **Issue:** Overuse of `"use client"` on top-level page routes. Pages like `app/(public)/movies/page.tsx`, `app/(public)/movies/genres/page.tsx`, and `app/(public)/search/page.tsx` are entirely client-side rendered.
- **Impact:** Larger JavaScript bundle sizes shipped to the client, slower initial page loads, and potentially weaker SEO for public movie/search pages.
- **Refactoring Action:** 
  - Shift data fetching (e.g., fetching initial movies or search results) to Server Components.
  - Extract only the interactive pieces (like the search input field, filters, or pagination controls) into smaller, dedicated Client Components.

### 3. Backend: Exception Handling Antipatterns
- **Issue:** Generic exception swallowing. Multiple services (especially in the `importer` module like `ImdbDatasetPipeline.java`, `ImdbImportService.java`, and `search` module like `SearchRefreshListener.java`) use `catch (Exception e)`. 
- **Impact:** Masks specific runtime issues (like `IOException`, `DataAccessException`, or `InterruptedException`), making the system brittle and bugs extremely hard to trace.
- **Refactoring Action:** 
  - Catch specific exceptions and handle them appropriately (e.g., logging and rethrowing as a custom `AppException`). 
  - Use `throws` in method signatures where exceptions should logically be handled by the caller.

### 4. Backend: Query Management
- **Issue:** Complex and massive string-based `@Query` blocks in repositories (e.g., `MovieRepository.java` has many multi-line `"""..."""` queries, some using hardcoded schemas like `imdb.movie`).
- **Impact:** Extremely difficult to maintain, test, and debug. No compile-time validation for native queries. Hardcoded schemas make environment migrations harder.
- **Refactoring Action:** 
  - Move highly complex dynamic queries to a custom repository implementation using `Criteria API`, `JOOQ`, or `QueryDSL`.
  - For static native queries, remove hardcoded schema prefixes and rely on the database connection/JPA configuration to resolve the schema.

### 5. Backend: API Validation Error Responses
- **Issue:** In `GlobalExceptionHandler.java`, the `handleValidationExceptions` method converts field errors to a string using `errors.toString()`.
- **Impact:** The client receives a poorly formatted string like `"{username=Username cannot be blank}"` instead of a structured JSON object or array, making it difficult for the frontend to map errors to specific form fields.
- **Refactoring Action:** 
  - Change the `message` payload for validation errors to return a structured map or list of field errors (e.g., `[ { "field": "username", "message": "..." } ]`) so the frontend can easily parse and display them.

### Summary Rating
- **Maintainability:** 6/10 (Room for improvement in typing and query management).
- **Reliability:** 7/10 (Good modular structure, but broad exception catches pose risks).
- **Performance:** 7/10 (Frontend SSR capabilities underutilized; backend batch importer needs careful monitoring).

---
*Note: This report is a high-level roadmap. Implementations should be done iteratively per module/component.*
