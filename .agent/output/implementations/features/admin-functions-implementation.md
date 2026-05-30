# Admin Functions Implementation

## User's intent
Implement the specific admin functions within the admin module, specifically targeting:
1. **Admin Manage Users**: Create a page to get user lists by user ID (`/api/admin/userlist/{userId}/lists`) and get all lists in the system (`/api/admin/userlist/all-lists`).
2. **Admin Job (Pending Tasks)**: Create a page to fetch and view pending tasks (`/api/admin/job/pending-tasks`), and approve or reject admin requests (`/api/admin/job/approve-admin` and `/api/admin/job/reject-admin`). This approve/reject action should only apply to tasks with `actionType = ADMIN_APPROVAL`.

## Results
- **API Client Additions:** Added the endpoints (`getUserLists`, `getAllLists`, `getPendingTasks`, `approveAdmin`, `rejectAdmin`) to the newly introduced `adminApi` inside `src/lib/api-client.ts`.
- **Admin Users Page (`src/app/admin/users/page.tsx`):**
  - Implemented an interface to list all user lists across the system on initial load.
  - Added a search form allowing the admin to input a `userId` to query lists specifically owned by that user.
  - Used `@tanstack/react-query` to handle loading states, caching, and errors elegantly.
- **Admin Jobs Page (`src/app/admin/jobs/page.tsx`):**
  - Fetched and displayed pending administrative jobs/tasks in a well-formatted table.
  - Conditionally rendered the "Approve" and "Reject" buttons only if `actionType === 'ADMIN_APPROVAL'`.
  - Wired the buttons to fire the respective `approveAdmin` and `rejectAdmin` mutations, utilizing the task's `targetEntityId` as the `userId` parameter.
  - Implemented cache invalidation upon successful approval/rejection to instantly refresh the pending tasks list.
- **Dashboard Links (`src/app/admin/page.tsx`):**
  - Updated the static placeholder cards on the Admin Dashboard to act as valid `Link` components navigating to `/admin/users` and `/admin/jobs`.
