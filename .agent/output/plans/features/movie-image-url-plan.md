# Plan: Compute and Serve Movie Image URLs (Refined)

## User's Intent
The user wants to compute and include a poster image URL for every movie in the movie-related API responses (DTOs) by integrating with the external TMDB (The Movie Database) API using Option 1 (backend redirect proxy with caching).
Specifically:
- Use the TMDB endpoint: `https://api.themoviedb.org/3/find/{film-id}?external_source=imdb_id` with an API Key Bearer Token.
- Inject the API Key Bearer Token from `apps/backend/src/main/resources/application.yml` and `secret.env`.
- Include the `imageUrl` property in the following DTOs:
  - `MovieBasicInfoDto`
  - `MovieRatingInfoDto`
  - `MovieFullInfoDto`
  - `MovieSearchResultDto` (in search module)
- Place `TmdbImageService` in `modules/shared/src/main/java/dev/sonle/filmdb/shared` so it is accessible to both `imdb` and `search` modules.
- Focus on the backend plan first.

---

## Results

### Proposed Architecture

To fulfill the requirements with minimal changes to the codebase and maximum code reusability:

1. **MovieImageEnabled Interface in `shared` module:**
   We will create a helper interface `MovieImageEnabled` in `dev.sonle.filmdb.shared`:
   ```java
   package dev.sonle.filmdb.shared;

   import com.fasterxml.jackson.annotation.JsonProperty;

   public interface MovieImageEnabled {
       String movieId();

       @JsonProperty("imageUrl")
       default String imageUrl() {
           return "/api/v1/imdb/film/" + movieId() + "/image";
       }
   }
   ```
   Since the DTOs are Java records, they already generate a public accessor method `movieId()` that returns the ID string. By simply implementing `MovieImageEnabled`, each DTO will automatically inherit the virtual `imageUrl` getter method. Jackson will detect the `@JsonProperty("imageUrl")` annotation on the interface's default method and serialize it to the JSON response.
   This avoids repeating duplicate code across all four DTOs and eliminates the need to change any JPA/JPQL repository query constructor signatures.

2. **Configuration (`secret.env` & `application.yml`):**
   - We will define `TMDB_BEARER_TOKEN` in `secret.env`.
   - We will map it in `apps/backend/src/main/resources/application.yml` under `app.tmdb.bearer-token`.

3. **TmdbImageService in `shared` module:**
   - Lives in `dev.sonle.filmdb.shared.utils` package.
   - Inject the bearer token using Spring `@Value`.
   - Uses `RestTemplate` to fetch TMDB results. Sends the API token using the `Authorization: Bearer <token>` header.
   - Searches both `movie_results` and `tv_results` to find the first available `poster_path`.
   - Integrates with Spring Cache (`@Cacheable`) to cache poster URLs in memory.

4. **Redirect Controller Endpoint:**
   - Add `GET /api/v1/imdb/film/{filmId}/image` to `MovieController` in the `imdb` module.
   - Resolves the image URL via `TmdbImageService`.
   - Returns an HTTP `302 Found` redirect to the TMDB CDN image (`https://image.tmdb.org/t/p/w500/...`).
   - If TMDB lookup fails or is unconfigured, redirects to a fallback placeholder image (e.g. Unsplash movie poster placeholder).

---

### Step-by-Step Backend Implementation Roadmap

#### Step 1: Enable Caching
- Modify [FilmDbApplication.java](file:///s:/Coding/Projects/film-db/apps/backend/src/main/java/dev/sonle/filmdb/app/FilmDbApplication.java) to add `@org.springframework.cache.annotation.EnableCaching`.

#### Step 2: Configure TMDB Bearer Token
- Add `TMDB_BEARER_TOKEN` placeholder to [secret.env](file:///s:/Coding/Projects/film-db/secret.env).
- Add TMDB configurations to [application.yml](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/application.yml):
  ```yaml
  app:
    tmdb:
      bearer-token: ${TMDB_BEARER_TOKEN:}
      image-base-url: https://image.tmdb.org/t/p/w500
  ```

#### Step 3: Create Shared Interface and Service
- Create `MovieImageEnabled` interface in `modules/shared` at `dev.sonle.filmdb.shared.interfaces.MovieImageEnabled`.
- Create `TmdbImageService` in `modules/shared` at `dev.sonle.filmdb.shared.utils.TmdbImageService`.
  - Include classes for TMDB JSON response parsing: `TmdbFindResult`, `TmdbMovieResult`, `TmdbTvResult`.

#### Step 4: Implement DTO Mapping
- Update the four target DTOs to implement `MovieImageEnabled`:
  - `dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto`
  - `dev.sonle.filmdb.imdb.dto.MovieRatingInfoDto`
  - `dev.sonle.filmdb.imdb.dto.MovieFullInfoDto`
  - `dev.sonle.filmdb.search.dto.MovieSearchResultDto` (in search module)

#### Step 5: Expose Redirect Endpoint
- Update [MovieController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/MovieController.java) to wire `TmdbImageService` and add the `/{film-id}/image` endpoint.
