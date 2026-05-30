# User's intent
The user wants to re-read the frontend codebase carefully, provide detailed and actionable suggestions for improvement, and rewrite the refactoring plan located at `s:/Coding/Projects/film-db/.agent/output/plans/refactor/frontend-refactor-plan.md` with these refined insights.

---

# Results

## Current Architecture & Detailed Codebase Audit

After a thorough review of the codebase (including components, global stores, routing structures, layouts, and public/private pages), several architectural flaws and performance bottlenecks have been identified:

### 1. Form Validation and Type Safety Gaps
* **Manual Forms:** Pages like [admin/users/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/admin/users/page.tsx) and inputs like [LiveSearchInput.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/ui/LiveSearchInput.tsx) use manual `useState` bindings and standard `React.FormEvent` onSubmit handlers.
* **UUID Validation Failure:** The admin query for user lists calls the backend with a raw string without validating if it is a valid UUID format (required by the backend database keys), leading to avoidable API failures.

### 2. Broken Responsive/Mobile UX
* **Unimplemented Mobile Menu:** In [Navbar.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/layout/Navbar.tsx) (lines 145-147), a mobile hamburger button `Menu` is rendered, but it has no `onClick` handler, state, or drawer menu. Mobile users cannot access sub-pages (Movies, Genres, People, Lists).

### 3. Inefficient Live Search & Over-fetching
* **Raw Fetch in Effect:** [LiveSearchInput.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/ui/LiveSearchInput.tsx) implements debouncing manually using `setTimeout` and executes raw `axios` API calls inside `useEffect`.
* **No Cache Reuse:** The manual request does not cache results. Backspacing and re-typing requests will re-trigger duplicate network calls to the server instead of reading from a query cache.

### 4. Non-Streaming Blocked Layouts (SSR Performance)
* **Pre-rendering Bottleneck:** In [movies/[id]/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/movies/[id]/page.tsx), details are loaded via `getMovie` on the server before anything is displayed. Because there is no nested `loading.tsx` or `<Suspense>` wrapper, navigation blocks the browser until the entire API call resolves.
* **Global Error Crash:** There are no sub-route `error.tsx` files. If an API call fails in a sub-route, the entire page crashes to the root `global-error.tsx` rather than maintaining Navbar and Footer layouts.

---

## Proposing Alternative Refactoring Paths

To resolve these architectural issues, we evaluate two viable approaches:

### Approach A: Progressive Client Enhancement (Recommended)
This approach prioritizes refactoring Client Components to make them responsive, cacheable, and type-safe, while utilizing standard Next.js layouts for server streaming.

* **1. Standardize Inputs with `react-hook-form` & Zod:**
  * Define UUID validation schema for the admin users search using Zod.
  * Integrate `react-hook-form` into [admin/users/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/admin/users/page.tsx) and [LiveSearchInput.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/ui/LiveSearchInput.tsx).
* **2. Refactor Live Search to TanStack React Query:**
  * Extract the debounced suggestion query into a custom hook `useLiveSearch` wrapping React Query's `useQuery`.
  * Set a `staleTime` of 1 minute so that repeat searches read instantly from memory.
* **3. Complete the Mobile Navbar Drawer:**
  * Add a client-side layout drawer in [Navbar.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/layout/Navbar.tsx) using state toggles to show navigation links on smaller viewports.
* **4. Introduce Next.js Route-Level Skeletons & Suspense:**
  * Implement `loading.tsx` in `(public)/movies/[id]` and `(public)/search` to immediately stream the page container while the data resolves in the background.

#### Pros & Cons
* **Pros:**
  * Instant performance boosts through cached queries and skeleton streaming.
  * Complete mobile compatibility for Navbar navigation.
  * Stronger client-side input validations before requests touch the API server.
* **Cons:**
  * Requires modifying multiple UI features concurrently.

---

### Approach B: Server Action & Query Param State Routing
This approach attempts to resolve search/filtering and state transitions strictly using Next.js Server Actions and URL query params, keeping forms purely native.

* **1. Query Params for Everything:**
  * Do not use React Query or client forms for search/filtering. On typing enter in search or selecting a filter, directly execute a native HTML GET form action or use server transitions.
* **2. Native Input Validation:**
  * Rely on browser-native validation (e.g. `<input pattern="...">` or `required`) instead of Zod schemas.
* **3. Server Side Mobile Collapsible Navbar:**
  * Manage Navbar toggle using CSS `:checked` checkbox hack or purely server-driven redirects.

#### Pros & Cons
* **Pros:**
  * Minimal JavaScript bundle size since `react-hook-form` and React Query are bypassed on these routes.
* **Cons:**
  * Bypasses the active TanStack Query setup already configured in the codebase.
  * Worse UX for live search suggestions (since search-as-you-type suggestions require immediate client-side feedback and abort signals).
  * Harder to build premium, dynamic transitions and micro-animations.

---

## Action Plan & Implementation Checklist

We recommend **Approach A** as it coordinates perfectly with the existing state technologies (Zod, React Query, Tailwind v4).

### Phase 1: Form & Validation Standardization
- [ ] **Admin UUID Validation:** Refactor [admin/users/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/admin/users/page.tsx) to validate User UUIDs using `react-hook-form` + Zod schema:
  ```ts
  const adminSearchSchema = z.object({
    userId: z.string().uuid("Must be a valid UUID format (e.g. 123e4567-e89b-12d3-a456-426614174000)"),
  });
  ```
- [ ] **Live Search Input Forms:** Update [LiveSearchInput.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/ui/LiveSearchInput.tsx) to submit via `react-hook-form`.

### Phase 2: Live Search Cache Optimization
- [ ] **Custom Hook `useLiveSearch`:** Create `src/hooks/useLiveSearch.ts` using React Query `useQuery` with `enabled` bindings for queries longer than 1 character.
- [ ] **Remove Axios Fetch from useEffect:** Strip manual timeouts and abort signals from [LiveSearchInput.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/ui/LiveSearchInput.tsx).

### Phase 3: Mobile Navigation Drawer (UX Fix)
- [ ] **Navbar Toggles:** In [Navbar.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/layout/Navbar.tsx), add a state:
  ```tsx
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  ```
- [ ] **Mobile Panel:** Render a responsive mobile slide-out sidebar when `mobileMenuOpen` is active, housing all nav links.

### Phase 4: Next.js Layout Streaming (Performance Fix)
- [ ] **Dynamic Skeletons:** Write `loading.tsx` skeletons for details and listings.
- [ ] **Local Error Boundaries:** Create route-level `error.tsx` boundaries to handle localized page fetch crashes gracefully without crashing the shell navbar.
