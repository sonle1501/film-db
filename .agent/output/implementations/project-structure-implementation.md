# Project Structure Refactoring Report

## User's intent
The user requested to refine the existing project structure and implement a scalable architecture based on Next.js App Router route groups, domain-driven feature components, and proper separation of concerns (hooks, store, types, lib, providers). They wanted to map out common application flows (public pages, auth flows, dashboard) and establish placeholders for upcoming functionality like `zustand` stores, `react-query` providers, and typed DTOs matching the Java backend.

## Results
We successfully migrated the codebase from the flat `app/` structure to a robust `src/` directory architecture, fulfilling all requirements of the provided folder tree. 

### 1. Route Groups & Routing Strategy
Moved the `app` folder into `src/app` and implemented Next.js Route Groups for layout segregation without affecting URL paths:
- **`(public)`**: Contains the main homepage (`page.tsx`), search (`search/page.tsx`), and details pages (`movies/[id]/page.tsx`, `people/[id]/page.tsx`). These pages share the default global layout with the Navbar and Footer.
- **`(auth)`**: Created `login/page.tsx` and `register/page.tsx`. These can easily opt out of the global Navbar if needed by adjusting layouts, though currently they share the root. They are isolated logically for auth flows.
- **`(dashboard)`**: Implemented a private area wrapped in `layout.tsx` (providing a sidebar and content area). Created `profile/page.tsx` and lists management (`lists/page.tsx`, `lists/[id]/page.tsx`).
- **Global Error Handling**: Created `global-error.tsx` for top-level boundary catching and `not-found.tsx` for custom 404s.

### 2. Component Reorganization
Migrated components from the generic `components` folder to a domain-driven structure:
- **`layout/`**: Kept `Navbar.tsx` and `Footer.tsx` here.
- **`features/movies/`**: Moved `MovieCard.tsx` here to group it by domain.
- **`ui/`**: Created the folder for future primitive components (e.g., Shadcn buttons).
- Updated all import paths in `page.tsx` and `TrendingSection.tsx` to use the `@/components/` alias.

### 3. Core Architecture & Tooling Setup
- **`tsconfig.json`**: Updated the `@/*` alias to resolve to `./src/*` instead of `./*`.
- **`lib/`**: Created `api-server.ts` with native `fetch` wrappers for RSCs and `api-client.ts` with Axios interceptors for client-side mutations. Also added a `utils.ts` for common helpers (e.g., `cn`, `formatDate`).
- **`hooks/`**: Stubbed out `useAuth.ts`, `useLists.ts`, and `useProfile.ts` to handle future React Query logic.
- **`store/`**: Established `useAuthStore.ts` for global client state using `zustand` (commented out until installed).
- **`types/`**: Defined exact TypeScript interfaces matching the Java backend DTOs (`auth.d.ts`, `imdb.d.ts`, `users.d.ts`).
- **`providers/`**: Added `query-provider.tsx` to wrap the app with React Query context when needed.
- **`middleware.ts`**: Initialized an Edge middleware at the `src` root to protect the `/profile` and `/lists` dashboard routes.

This scalable architecture sets a strong foundation for integrating the backend APIs and managing complex application state going forward.
