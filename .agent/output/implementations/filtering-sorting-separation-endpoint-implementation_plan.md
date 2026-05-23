# Plan: Separate Filtering and Sorting Endpoints

This implementation plan outlines the strategy to add new, dedicated backend endpoints and frontend integrations for sorting filtered movie results. The original filtering endpoints and UI states will remain completely untouched. When sorting is selected, the application will direct requests to the new sorting-enabled endpoints.

---

## Backend Changes

### 1. New Request DTO

Create a new DTO `MovieFilterSortRequestDto` that includes all of the original filter fields plus two new fields for sorting configuration:
- `sortBy`: `"averageRating"` or `"numVotes"`
- `sortDirection`: `"asc"` or `"desc"`

#### [NEW] [MovieFilterSortRequestDto.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/dto/MovieFilterSortRequestDto.java)
```java
package dev.sonle.filmdb.imdb.dto;

import java.math.BigDecimal;

public record MovieFilterSortRequestDto(
    Integer startYear,
    BigDecimal averageRating,
    Integer numVotes,
    String titleType,
    String sortBy,
    String sortDirection
) {}
```

---

### 2. Controller layer

Add two new `@PatchMapping` endpoints to handle filtering with sorting. This keeps the original endpoints (`/filter` and `/filter-year`) separate.

#### [MODIFY] [MovieListController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/MovieListController.java)
Add the following endpoints:
- `PATCH /api/v1/imdb/listfilm/filter/sort`
- `PATCH /api/v1/imdb/listfilm/filter-year/sort`

```java
    @PatchMapping("/filter/sort")
    public ResponseEntity<Page<MovieRatingInfoDto>> filterAndSortMovies(
            @RequestBody MovieFilterSortRequestDto filterSortRequest,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(movieFilterService.filterAndSortMovies(filterSortRequest, page, size));
    }

    @PatchMapping("/filter-year/sort")
    public ResponseEntity<Page<MovieRatingInfoDto>> filterAndSortMoviesExactYear(
            @RequestBody MovieFilterSortRequestDto filterSortRequest,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(movieFilterService.filterAndSortMoviesExactYear(filterSortRequest, page, size));
    }
```

---

### 3. Service Layer

Add the logic to translate frontend sort fields (e.g. `"averageRating"`) into database-compatible entity aliases (e.g. `"r.averageRating"`), construct the Spring Data `Sort` object, and reuse the existing JPQL queries in `MovieRepository` by passing the sorted `Pageable`.

#### [MODIFY] [MovieFilterService.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/service/MovieFilterService.java)
Add the implementation methods for sorting:
```java
    public Page<MovieRatingInfoDto> filterAndSortMovies(MovieFilterSortRequestDto request, int page, int size) {
        int maxSize = 10;
        int actualSize = Math.min(size, maxSize);
        Pageable pageable = createSortedPageable(page, actualSize, request.sortBy(), request.sortDirection());
        
        return movieRepository.filterMovies(
                request.startYear(),
                request.averageRating(),
                request.numVotes(),
                request.titleType(),
                pageable
        );
    }

    public Page<MovieRatingInfoDto> filterAndSortMoviesExactYear(MovieFilterSortRequestDto request, int page, int size) {
        int maxSize = 10;
        int actualSize = Math.min(size, maxSize);
        Pageable pageable = createSortedPageable(page, actualSize, request.sortBy(), request.sortDirection());

        return movieRepository.filterMoviesExactYear(
                request.startYear(),
                request.averageRating(),
                request.numVotes(),
                request.titleType(),
                pageable
        );
    }

    private Pageable createSortedPageable(int page, int size, String sortBy, String direction) {
        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
            String field = switch (sortBy) {
                case "averageRating" -> "r.averageRating";
                case "numVotes" -> "r.numVotes";
                case "startYear" -> "m.startYear";
                default -> null;
            };
            if (field != null) {
                sort = Sort.by(dir, field);
            }
        }
        return PageRequest.of(page, size, sort);
    }
```

---

## Frontend Changes

### 1. API Client Updates

Expose the two new endpoints as separate functions in the api client.

#### [MODIFY] [api-client.ts](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/lib/api-client.ts)
Add:
```typescript
  filterAndSortMovies: async (
    filters: { 
      startYear?: number | null; 
      averageRating?: number | null; 
      numVotes?: number | null; 
      titleType?: string | null;
      sortBy: string;
      sortDirection: string;
    }, 
    page = 0, 
    size = 10
  ) => {
    const res = await apiClient.patch('/api/v1/imdb/listfilm/filter/sort', filters, {
      params: { page, size }
    });
    return res.data;
  },

  filterAndSortMoviesExactYear: async (
    filters: { 
      startYear?: number | null; 
      averageRating?: number | null; 
      numVotes?: number | null; 
      titleType?: string | null;
      sortBy: string;
      sortDirection: string;
    }, 
    page = 0, 
    size = 10
  ) => {
    const res = await apiClient.patch('/api/v1/imdb/listfilm/filter-year/sort', filters, {
      params: { page, size }
    });
    return res.data;
  }
```

---

### 2. Movies Page UI and State

Maintain two flows: standard filtering and filtered-with-sorting.

#### [MODIFY] [page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/movies/page.tsx)

1. **State variables:**
   ```typescript
   const [sortBy, setSortBy] = useState<string>(""); // empty represents no sort / default sorting
   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
   ```

2. **Fetching Logic (branching based on state):**
   Modify `fetchFilteredMovies` to read the state. If `sortBy` is set, invoke the new sorting API. Otherwise, invoke the standard filtering API:
   ```typescript
   const fetchFilteredMovies = async (pageToFetch: number, currentSortBy = sortBy, currentSortDir = sortDirection) => {
     setIsLoading(true);
     setError(null);
     setActiveFilter(null);
     setSearchQuery("");

     const startYear = filterStartYear ? parseInt(filterStartYear) : null;
     const averageRating = filterMinRating ? parseFloat(filterMinRating) : null;
     const numVotes = filterMinVotes ? parseInt(filterMinVotes) : null;
     const titleType = filterTitleType || null;

     try {
       let data;
       if (currentSortBy) {
         // Call new Sorting APIs
         const payload = { startYear, averageRating, numVotes, titleType, sortBy: currentSortBy, sortDirection: currentSortDir };
         data = filterExactYear
           ? await movieApi.filterAndSortMoviesExactYear(payload, pageToFetch, 10)
           : await movieApi.filterAndSortMovies(payload, pageToFetch, 10);
       } else {
         // Call original Filter APIs
         const payload = { startYear, averageRating, numVotes, titleType };
         data = filterExactYear
           ? await movieApi.filterMoviesExactYear(payload, pageToFetch, 10)
           : await movieApi.filterMovies(payload, pageToFetch, 10);
       }
       setMovies(mapMovieData(data.content || []));
       setCurrentPage(data.number || 0);
       setTotalPages(data.totalPages || 0);
       setTotalElements(data.totalElements || 0);
       setIsFiltered(true);
     } catch (err: any) {
       setError(err.response?.data?.message || err.message || "Failed to fetch movies");
       setMovies([]);
       setTotalPages(0);
       setTotalElements(0);
     } finally {
       setIsLoading(false);
     }
   };
   ```

3. **Handling Actions:**
   - **Clicking Apply Filter:** Resets sort parameters (`setSortBy("")`) and performs normal filtering.
   - **Selecting a Sort Option:** Calls a handler to set the sort state and perform the sorted refetch:
     ```typescript
     const handleSort = (field: string) => {
       setSortBy(field);
       fetchFilteredMovies(0, field, sortDirection);
     };

     const handleSortDirection = (direction: "asc" | "desc") => {
       setSortDirection(direction);
       fetchFilteredMovies(0, sortBy, direction);
     };
     ```

4. **UI Elements:**
   - Add a premium sort bar below or next to the results counter:
     - Rendered only if `isFiltered` is `true`.
     - Displays two selection tabs or buttons: **"Rating"** and **"Votes"**.
     - An up/down arrow button to toggle order direction between Ascending and Descending.
