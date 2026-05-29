# User's intent
The user wants to refactor API controller URLs in the modular monolith to decouple the version prefix (`/api/v1/`) and make it dynamically configurable from `application.yml` or external environment variables. They approved Approach A (PathMatchConfigurer and custom `@VersionedApi` annotation) combined with Option 1 (Selective Versioning for public/data APIs, leaving admin and auth unchanged).

# Results

The refactoring has been successfully completed:

## 1. Version Property in YAML
* **[application.yml](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/application.yml):** Added `app.api.version: v1` property under the `app` namespace.

## 2. Marker Annotation
* **[VersionedApi.java](file:///s:/Coding/Projects/film-db/modules/shared/src/main/java/dev/sonle/filmdb/shared/annotation/VersionedApi.java):** Created the runtime annotation to identify rest controllers that should get version-prefixed.

## 3. Dynamic Prefix Mapping Configuration
* **[WebMvcConfig.java](file:///s:/Coding/Projects/film-db/modules/shared/src/main/java/dev/sonle/filmdb/shared/config/WebMvcConfig.java):** Configured Spring's `PathMatchConfigurer` to prepend `/api/{version}` to all RestControllers annotated with `@VersionedApi`.

## 4. Controller Refactoring
Replaced hardcoded version prefixes with `@VersionedApi` and simplified paths to:
* **[GenreController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/GenreController.java):** Map to `/imdb/genres` instead of `/api/v1/imdb/genres`.
* **[MovieController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/MovieController.java):** Map to `/imdb/film` instead of `/api/v1/imdb/film`.
* **[MovieListController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/MovieListController.java):** Map to `/imdb/listfilm` instead of `/api/v1/imdb/listfilm`.
* **[PersonController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/PersonController.java):** Map to `/imdb/person` instead of `/api/v1/imdb/person`.
* **[TvSeriesController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/TvSeriesController.java):** Map to `/imdb/tvseries` instead of `/api/v1/imdb/tvseries`.
* **[SearchController.java](file:///s:/Coding/Projects/film-db/modules/search/src/main/java/dev/sonle/filmdb/search/api/SearchController.java):** Map to `/search` instead of `/api/v1/search`.
* **[UserController.java](file:///s:/Coding/Projects/film-db/modules/users/src/main/java/dev/sonle/filmdb/users/controller/UserController.java):** Map to `/user/profile` instead of `/api/v1/user/profile`.
* **[UserListController.java](file:///s:/Coding/Projects/film-db/modules/users/src/main/java/dev/sonle/filmdb/users/controller/UserListController.java):** Map to `/users/lists` instead of `api/v1/users/lists`.
* **[UserListDetailsController.java](file:///s:/Coding/Projects/film-db/modules/users/src/main/java/dev/sonle/filmdb/users/controller/UserListDetailsController.java):** Map to `/users/lists` instead of `api/v1/users/lists`.
