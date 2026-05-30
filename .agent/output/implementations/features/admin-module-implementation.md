# Admin Module Implementation

## User's intent
Implement the admin module following these ideas:
1. Add a "login as admin" and "register admin" options in the login and register pages.
2. The login admin should use the normal login API, query the user profile, and succeed if the role is admin; otherwise, it fails.
3. The register admin should use the `/api/auth/register/admin` API.
4. Create a new admin group, rendering an admin UI with a simple placeholder that is only accessible to users with the admin role.

## Results
- **API Client updates:** Added the `registerAdmin` method in `src/lib/api-client.ts` to call `/api/auth/register/admin`.
- **Hooks update:** Extended `src/hooks/useAuth.ts` with `loginAdmin` and `registerAdmin` mutations. The `loginAdmin` mutation checks if the user's role is `ADMIN` or `ROLE_ADMIN` and throws an error if they are not.
- **Login & Register UI updates:** Modified `src/app/(auth)/login/page.tsx` and `src/app/(auth)/register/page.tsx` to include an inline toggle allowing the user to select between "User" and "Admin" flows. The UI uses the appropriate mutations based on this state.
- **Admin Layout & Routing:** Created `src/app/admin/layout.tsx` to serve as a protected layout only accessible to authenticated users with admin privileges. It checks the role and redirects non-admins appropriately.
- **Admin Dashboard Placeholder:** Built a placeholder admin dashboard at `src/app/admin/page.tsx` containing cards for User Management, Admin Requests, and System Analytics.
