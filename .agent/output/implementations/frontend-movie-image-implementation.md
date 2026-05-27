# Implementation: Consume Movie Image URLs on Frontend

## User's Intent
Integrate support on the Next.js `film-db UI` frontend to display the dynamic movie poster images retrieved from the backend proxy endpoint (`/api/v1/imdb/film/{id}/image`).

---

## Results

We successfully updated the frontend application to consume the backend's image endpoint:

### 1. Updated TypeScript Declarations
- Modified [imdb.d.ts](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/types/imdb.d.ts) to declare `imageUrl?: string;` property on DTO interfaces:
  - `MovieBasicInfoDto`
  - `FullMovieInfo`
  - `MovieSearchResultDto`

### 2. Created Helper Utility
- Implemented `getMoviePosterUrl(imageUrl?: string | null)` in [utils.ts](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/lib/utils.ts).
- Resolves relative routes using `process.env.NEXT_PUBLIC_API_URL` (defaulting to `http://localhost:8080`) and handles the fallback to a default Unsplash placeholder if `imageUrl` is null or unconfigured.

### 3. Integrated Dynamic Mapping in Pages
- Replaced hardcoded placeholders with `getMoviePosterUrl(item.imageUrl)` inside:
  - **[movies/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/movies/page.tsx)**: Dynamic resolution in trending, search-by-id, and filtered lists.
  - **[movies/[id]/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/movies/[id]/page.tsx)**: Details backdrop and cover page poster.
  - **[movies/genres/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/movies/genres/page.tsx)**: Display of genre items.
  - **[search/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/search/page.tsx)**: Search results map.
  - **[lists/[id]/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(dashboard)/lists/[id]/page.tsx)**: Display of items in a user's list.
