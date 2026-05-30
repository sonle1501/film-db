# Movies Search Implementation

## User's intent
The user wants to implement the search functionality on the Movies page (`@src/app/(public)/movies/page.tsx`). Specifically, the search bar should have a dropdown to allow searching by either **ID** or **Name**. When "search by id" is selected, clicking search should consume the API `{{baseUrl}}/api/v1/imdb/film/:film-id` from the backend and render the returned movie on the page.

## Results
- Refactored `src/app/(public)/movies/page.tsx` to be a Client Component (`"use client"`) in order to manage search state (`searchType`, `searchQuery`, `movies`, `isLoading`, `error`).
- Added a `<select>` dropdown inside the search bar container with two options: "Search by ID" and "Search by Name".
- Added an explicit "Search" button with a loading spinner state.
- Implemented `handleSearch` to fetch data from the backend via the standard `fetch` API:
  - If type is "id", it consumes `${API_BASE_URL}/api/v1/imdb/film/${id}` and maps the `MovieBasicInfoDto` object to the local `MovieProps` array (with fallbacks for missing image/genre data).
  - If type is "name", it consumes `${API_BASE_URL}/api/v1/imdb/listfilm/by-name?name=${name}` and maps the list of results.
- Added error handling states to clearly indicate to the user if a movie was not found.
- Updated the main grid layout to reflect either the `mockMovies` (default "Trending Now"), the active search results, or a "No movies found" empty state.
