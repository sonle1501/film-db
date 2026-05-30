**Architecture & Tech Stack:**

- **Pattern:** App Router with component-driven architecture.
    
- **Language:** TypeScript
    
- **Framework:** Next.js 16.2.6 (React 19)
    
- **Styling:** Tailwind CSS v4
    
- **State & Data Management:** Zustand 5 (Client State) & TanStack React Query 5 (Server State)

More details: see the [package.json](../../apps/frontend/film-db-ui/package.json)

**Codebase Structure:**

The Next.js application is organized into route groups and core layers under `src`:

- `app`: Configures route layouts, error boundaries, and pages:
  - `(auth)`: User login and registration routes.
  - `(dashboard)`: User profile management and custom lists.
  - `(public)`: Public movie, cast/person, and general search pages.
  - `admin`: Admin portal for managing background importer jobs and users.
  - ...
    
- `components`: Categorized UI blocks (features, home, layout, and shared UI primitives).
    
- `hooks`: Custom react hooks for authentication, profile updates, and list operations.
    
- `lib`: Base API clients (`api-client.ts` for browser, `api-server.ts` for server components) and common utilities.
    
- `store`: Client-side state stores (e.g., global auth state managed via Zustand).
    
- `types`: TypeScript definition files mapped to the backend core domains (admin, auth, imdb, users).
