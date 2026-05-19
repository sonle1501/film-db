# Implementation Report: Movies & People Pages

## User's intent
The user wants to implement basic UI structures for the `@src/app/(public)/movies/page.tsx` and `@src/app/(public)/people/page.tsx` pages, bypassing backend integration for now. 
- **Movies Page:** Needs a search bar with specific hint text ("find movie with name, with id, with alternative..."), a default "Trending" movie view, and quick filter buttons like "Top 250" and "Top TvSeries".
- **People Page:** Needs a basic UI layout, likely consistent with the rest of the application, featuring a search mechanism and a grid display for people (actors, directors, etc.).

## Results
- **`src/app/(public)/movies/page.tsx`:** 
  - Implemented the page layout with a prominent search bar displaying the requested placeholder.
  - Added filter button options (`Trending`, `Top 250`, `Top TV Series`) utilizing `lucide-react` icons for enhanced visual feedback.
  - Sourced the existing `MovieCard` component (`@/components/features/movies/MovieCard`) and created a mock dataset to render a responsive grid of trending movies.
- **`src/app/(public)/people/page.tsx`:**
  - Implemented a consistent page layout matching the Movies page.
  - Added a search input for actors/directors and a filter button.
  - Created an inline `PersonCard` component layout within the grid, displaying mock data for popular people, including their names, roles, and a popularity score.
- The UI leverages TailwindCSS and CSS variables established in the project (e.g., `surface-dark`, `primary-500`) to maintain design consistency. Both pages are fully responsive.
