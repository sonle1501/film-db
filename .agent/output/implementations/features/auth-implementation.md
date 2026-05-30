# Auth Implementation Report

## User's intent
The user wanted to implement the login and register flow based on the backend API, utilizing JWT access tokens and handling refresh tokens via the `/code` workflow.

## Results
- **API Client Setup (`src/lib/api-client.ts`)**: 
  - Integrated `axios` to handle API requests.
  - Added a request interceptor to automatically inject the Bearer JWT token into the `Authorization` header.
  - Added a response interceptor to intercept `401 Unauthorized` responses. When triggered, it automatically calls the `/api/auth/refresh` endpoint to retrieve a new token and retries the original request.
  - Defined the `authApi` object providing methods for `login`, `register`, `logout`, and fetching user profile.
- **Global Auth Store (`src/store/useAuthStore.ts`)**:
  - Leveraged `zustand` to manage global authentication state (`token` and `user` object).
  - Used `persist` middleware to ensure auth state remains intact across browser reloads.
- **Auth Hooks (`src/hooks/useAuth.ts`)**:
  - Implemented the `useAuth` hook utilizing `@tanstack/react-query` to execute login, register, and logout mutations. 
  - Handled side-effects automatically (e.g. storing token, fetching additional user profile on successful authentication, clearing auth state on logout).
- **Types (`src/types/auth.d.ts`)**:
  - Refined `RegisterRequestDto` to accurately reflect the OpenAPI specification (removed unnecessary `email` field).
- **UI & Form Integration (`src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`)**:
  - Utilized `react-hook-form` along with `@hookform/resolvers/zod` for strictly typed form validations matching the required inputs (Username and Password).
  - Wired forms to the `useAuth` hooks, handling loading states, displaying error messages on failure, and redirecting the user to the home page (`/`) on success.
- **Navbar Integration (`src/components/layout/Navbar.tsx`)**:
  - Updated the Navbar to dynamically react to the user's authentication state via `useAuthStore`.
  - Displayed a user dropdown with a logout action when authenticated, or standard Sign In/Sign Up links when anonymous.