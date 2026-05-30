# Implementation: Compute and Serve Movie Image URLs

## User's Intent
Integrate dynamic movie poster image URLs from the external TMDB API into the backend DTO responses with minimal changes to the database and JPA repositories, focusing on the backend first.

---

## Results

We successfully implemented Option 1 (Lazy Redirect Caching Proxy) across the backend modular monolith:

### 1. Enabled Application Caching
- Modified [FilmDbApplication.java](file:///s:/Coding/Projects/film-db/apps/backend/src/main/java/dev/sonle/filmdb/app/FilmDbApplication.java) to add `@org.springframework.cache.annotation.EnableCaching`.

### 2. Configuration Parameters
- Added a blank placeholder for `TMDB_BEARER_TOKEN` in [secret.env](file:///s:/Coding/Projects/film-db/secret.env).
- Configured keys in [application.yml](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/application.yml) under `app.tmdb.bearer-token` and `app.tmdb.image-base-url` (defaulting to `https://image.tmdb.org/t/p/w500`).

### 3. Movie Image Interface (Shared Module)
- Created the [MovieImageEnabled.java](file:///s:/Coding/Projects/film-db/modules/shared/src/main/java/dev/sonle/filmdb/shared/MovieImageEnabled.java) interface in `modules/shared` containing a default `imageUrl()` method mapped via Jackson's `@JsonProperty("imageUrl")`.
- This ensures any record implementing this interface automatically includes the dynamic `/api/v1/imdb/film/{id}/image` relative link in its JSON representation.

### 4. TMDB Image Resolution Service (Shared Module)
- Created [TmdbImageService.java](file:///s:/Coding/Projects/film-db/modules/shared/src/main/java/dev/sonle/filmdb/shared/service/TmdbImageService.java) in `modules/shared`.
- The service performs a lookup against TMDB's find API using Bearer Token authentication.
- Automatically handles both movies and TV series results.
- Caches resolutions in memory via Spring Cache (`@Cacheable(value = "tmdbImages")`) to prevent duplicate HTTP requests to the third-party endpoint.

### 5. Updated Movie DTO Records
- Implemented `MovieImageEnabled` on:
  - `MovieBasicInfoDto` in [MovieBasicInfoDto.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/dto/MovieBasicInfoDto.java)
  - `MovieRatingInfoDto` in [MovieRatingInfoDto.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/dto/MovieRatingInfoDto.java)
  - `MovieFullInfoDto` in [MovieFullInfoDto.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/dto/MovieFullInfoDto.java)
  - `MovieSearchResultDto` in [MovieSearchResultDto.java](file:///s:/Coding/Projects/film-db/modules/search/src/main/java/dev/sonle/filmdb/search/dto/MovieSearchResultDto.java) (search module)

### 6. Redirect Endpoint
- Configured a new GET mapping `/{film-id}/image` in [MovieController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/MovieController.java) (imdb module).
- Dynamically redirects (HTTP 302 Found) callers to the resolved TMDB CDN poster path, or defaults to a high-quality movie placeholder on Unsplash if TMDB data is unavailable or unconfigured.
