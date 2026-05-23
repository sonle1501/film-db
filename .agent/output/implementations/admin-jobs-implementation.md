# Implementation Report: Admin Jobs and Tasks Actions

## User's intent
The user wants to modify the admin jobs management page (`src/app/admin/jobs/page.tsx`) to:
1. Render all tasks.
2. Restrict the "Approve" and "Reject" actions to only work (be visible and interactive) when the task has `actionType === 'ADMIN_APPROVAL'` and `state === 'PENDING'`.
3. Provide toast notifications upon successful approval or rejection and dynamically transition the status/state of the task to `APPROVED` or `REJECTED` in the UI immediately.

## Results
- **Page Update (`src/app/admin/jobs/page.tsx`)**:
  - Imported `toast` from `react-hot-toast` to handle notifications.
  - Refactored `approveMutation` and `rejectMutation` to:
    - Trigger `toast.success` notifications upon success.
    - Trigger `toast.error` notifications on failure.
    - Update the React Query cached data (`['admin-pending-tasks']`) directly using `queryClient.setQueryData` on success to immediately set the task's state to `'APPROVED'` or `'REJECTED'`. This provides immediate UI feedback.
  - Updated status badge rendering to dynamically set background, text, and border colors based on the task's current state (`PENDING` is yellow, `APPROVED` is green, `REJECTED` is red, and other states are gray).
  - Restructured table actions: only render the "Approve" and "Reject" buttons if `job.actionType === 'ADMIN_APPROVAL'` and `job.state === 'PENDING'`, showing `"No actions available"` otherwise.
