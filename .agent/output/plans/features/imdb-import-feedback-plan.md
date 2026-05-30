# Importer Feedback Dashboard Plan (Option B: Database-Backed Progress Tracking)

This plan describes the architectural changes, database updates, and implementation roadmap to enable administrators to trigger the IMDB dataset import pipeline, track progress percentages, and view live logs.

## User's intent

The user wants to implement Option B (Database-Backed Polling + Spring Events) for pipeline feedback, and build a beautiful dashboard in the Next.js frontend at `/admin/import` with:
1. An action card to trigger the IMDB import pipeline.
2. A verification modal confirmation popup before starting the import.
3. A live dashboard board with visual progress bars, status indicators, and a scrolling log console window to monitor active running jobs.

---

## Results

### 1. Backend Architecture (Completed)
- **Database Schema:** Created migration `V5` for the `admin.import_job_history` table (adding `progress`, `current_stage`, and `logs`).
- **Spring Events:** Integrated `ImportProgressEvent` and `ImportJobEventListener` with `Propagation.REQUIRES_NEW` to write progress and logs to the database in real-time.
- **Async Execution:** Controller runs the pipeline asynchronously using `CompletableFuture.runAsync()`, returning a `202 Accepted` job status and UUID immediately.

---

### 2. Frontend Architecture (Proposed)

We will build the frontend admin interface using Next.js, Tailwind CSS, and TanStack React Query.

#### Options for Real-Time Polling:
* **Option A: TanStack React Query `refetchInterval` (Recommended)**
  * Use a query hook querying `/api/admin/import-pipeline/status?jobId=UUID` with a dynamic `refetchInterval` (e.g., `1000ms` if the job status is `PENDING` or `IN_PROGRESS`, and `false` otherwise).
  * **Pros:** Highly declarative, fits with the existing project's React Query codebase, clean caching/retry management.
* **Option B: Manual `setInterval` Polling**
  * Use `setInterval` inside a React `useEffect` hook.
  * **Pros:** Direct control over request frequency.
  * **Cons:** Boilerplate code, manual cleanup required on component unmount, prone to race conditions if requests take longer than the interval.

**Recommendation:** Proceed with **Option A** for clean state synchronization and seamless integration with existing API clients.

---

### 3. File & Component Layout

#### [MODIFY] [api-client.ts](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/lib/api-client.ts)
- Add administrative endpoints under `adminApi`:
  - `runImportPipeline()`: `POST /api/admin/import-pipeline/run`
  - `getImportStatus(jobId)`: `GET /api/admin/import-pipeline/status`
  - `getImportHistory()`: `GET /api/admin/import-pipeline/history`

#### [MODIFY] [page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/admin/page.tsx)
- Add a dashboard card for "IMDB Ingest Pipeline" linking to `/admin/import`.

#### [NEW] [import/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/admin/import/page.tsx)
- Implement the primary dashboard page:
  - **Confirmation Dialog:** A modal overlays the screen when "Trigger Import" is clicked, prompting confirmation to avoid accidental runs.
  - **Visual Board Dashboard:**
    - **Progress Bar:** High-fidelity animated bar matching the database `progress` (0% to 100%).
    - **Stage Visualizer:** Horizontal step timeline representing states: `PREPARATION` $\rightarrow$ `DOWNLOADING` $\rightarrow$ `IMPORTING` $\rightarrow$ `INDEXING` $\rightarrow$ `SWAP` (Success/Failed).
    - **Live Logs Console:** Fixed-height, black console box with auto-scroll-to-bottom displaying `job.logs`.
  - **History Section:** A table listing historical runs showing run duration, final status, and triggering admin.

---

## Proposed Roadmap

1. **Step 1:** Modify `api-client.ts` to add endpoints.
2. **Step 2:** Modify `/admin/page.tsx` to add the navigation card.
3. **Step 3:** Implement `/admin/import/page.tsx` including confirmation modal, progress bar, stage timeline, auto-scrolling log console, and history log.
