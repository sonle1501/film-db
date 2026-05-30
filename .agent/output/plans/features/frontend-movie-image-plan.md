# Plan: Consume Movie Image URLs on Frontend

## User's Intent
The user wants to implement frontend support in the Next.js `film-db UI` to display the dynamic movie poster images retrieved from the backend proxy endpoint (`/api/v1/imdb/film/{id}/image`). The plan should describe how to update the components and types with minimal footprint and maximum durability.

---

## Results

### Trade-off Analysis & Options

We analyzed two primary ways to consume and map the backend `imageUrl` property in the Next.js frontend codebase:

#### Option A: Centralized Helper Function (Recommended)
Add an `imageUrl?: string;` property to target TypeScript DTOs in `src/types/imdb.d.ts`. Add a utility helper function `getMoviePosterUrl(imageUrl?: string | null)` in `src/lib/utils.ts` to prepend the API base URL for relative paths and fall back to the Unsplash placeholder. Update page mappings to use this utility.

- **Pros:**
  - **Explicit and Maintainable:** All image-resolution logic resides in a single utility function. If TMDB sizes or backend routing change, it requires only a single update.
  - **Type-safe:** Correctly updates the DTO models in typescript, warning developer of any properties mismatches.
  - **Fallback Consistency:** Guarantees a default placeholder image if the backend lookup fails (returns null) or is unconfigured.
- **Cons:**
  - Requires updating the mapping block in ~4 frontend pages/components.

#### Option B: API Client Post-Processing Mapper
Intersect API calls in `api-client.ts` and `api-server.ts` to recursively scan DTO responses and replace relative paths of `imageUrl` with absolute URLs.

- **Pros:**
  - Zero changes in individual page files; the page mappers see `imageUrl` as already fully resolved.
- **Cons:**
  - **Magic/Brittle:** Inspecting and mutating objects in the client interceptor is slow, error-prone, and behaves unpredictably if nested payloads or pagination formats change.
  - Harder to customize fallback behavior for specific pages.

---

### Recommended Approach: Option A

#### 1. Define Helper Utility
We will create `getMoviePosterUrl` in `src/lib/utils.ts`:
```typescript
export function getMoviePosterUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=800&q=80";
  }
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return `${baseUrl}${imageUrl}`;
}
```

#### 2. Update TypeScript Interfaces
Add optional `imageUrl` property to interfaces in `src/types/imdb.d.ts`:
- `MovieBasicInfoDto`
- `FullMovieInfo`
- `MovieSearchResultDto`

#### 3. Update Mapping Logic in Frontend Files
Update mapping functions (e.g. `mapMovieData` and `mapMovieProps`) in the following files to use the utility:
- **[movies/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/movies/page.tsx)**: Resolve images for trending/search lists.
- **[movies/[id]/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/movies/[id]/page.tsx)**: Display the cover and detail posters.
- **[movies/genres/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/movies/genres/page.tsx)**: Display posters in genre results.
- **[search/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/search/page.tsx)**: Display posters in search results.
- **[lists/[id]/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(dashboard)/lists/[id]/page.tsx)**: Resolve images in user lists.

---

### Step-by-Step Frontend Implementation Roadmap

#### Step 1: Update TypeScript Types
- Add `imageUrl?: string;` to `MovieBasicInfoDto`, `FullMovieInfo`, and `MovieSearchResultDto` in `src/types/imdb.d.ts`.

#### Step 2: Implement Utility Function
- Export `getMoviePosterUrl` helper inside `src/lib/utils.ts`.

#### Step 3: Replace Hardcoded Placeholders in Pages
- Replace the hardcoded Unsplash image URLs with `getMoviePosterUrl(item.imageUrl)` in:
  - `src/app/(public)/movies/page.tsx`
  - `src/app/(public)/movies/[id]/page.tsx` (both backdrop and main poster)
  - `src/app/(public)/movies/genres/page.tsx`
  - `src/app/(public)/search/page.tsx`
  - `src/app/(dashboard)/lists/[id]/page.tsx`
