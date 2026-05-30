# Search Engine Implementation

This document details the code changes made to implement the PostgreSQL-based search engine with custom mathematical popularity and rating scoring.

## User's intent

The goal was to implement the approved search engine plan:
1.  **Flyway Migration**: Create the `V6__create_movie_search.sql` migration script to build the `search.movie_search` materialized view and indexes.
2.  **Decoupled Refresh**: Replace the interface injection method with Spring Application Events (`ImdbDataImportedEvent`) and an `@Async` listener to asynchronously trigger view refreshes.
3.  **Renamed Structures**: Ensure all names are renamed from `movie_search_index`/`search_index` to `movie_search` and `search`.
4.  **Separated Search Endpoints**: Route search queries through separate endpoints for smart global search (`/api/v1/search` and `/api/v1/search/live`) and Vietnamese localized search (`/api/v1/search/vn` and `/api/v1/search/vn/live`).
5.  **Repository Queries**: Use `NamedParameterJdbcTemplate` to run FTS and trigram query templates safely.

---

## Results

We successfully implemented the search engine architecture by introducing and modifying the following components:

### 1. Database Schema Migration
Created the Flyway migration file: [V6__create_movie_search.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db/migration/V6__create_movie_search.sql).
- Defins the `search.movie_search` materialized view with two pre-computed Full Text Search vectors: `main_search_vector` (English stemmed) and `vietnamese_search_vector` (Simple stemmed).
- Encodes the custom mathematical popularity scoring model directly into the database view under `popularity_boost_multiplier` (using logarithmic vote counts, Bayesian average rating to correlation rating, and penalties for vote counts < 500 and ratings < 4.0).
- Sets up a unique index `idx_movie_search_id` on the view's primary key (`movie_id`) so concurrent refreshes are permitted.
- Creates FTS and Trigram (`pg_trgm`) indexes on search vectors and title columns to speed up text queries and prefix matches.

### 2. Loose Ingestion Coupling via Spring Events
- **Spring Event Created**: [ImdbDataImportedEvent.java](file:///s:/Coding/Projects/film-db/modules/shared/src/main/java/dev/sonle/filmdb/shared/event/ImdbDataImportedEvent.java) inside the shared module.
- **Event Published**: Modified [ImdbDatasetPipeline.java](file:///s:/Coding/Projects/film-db/modules/importer/src/main/java/dev/sonle/filmdb/importer/pipeline/ImdbDatasetPipeline.java) to publish `ImdbDataImportedEvent` using `ApplicationEventPublisher` right after the atomic swap transaction successfully commits.
- **Service Created**: [SearchRefreshService.java](file:///s:/Coding/Projects/film-db/modules/search/src/main/java/dev/sonle/filmdb/search/service/SearchRefreshService.java) executing the concurrent refresh query `REFRESH MATERIALIZED VIEW CONCURRENTLY search.movie_search`.
- **Async Event Listener Created**: [SearchRefreshListener.java](file:///s:/Coding/Projects/film-db/modules/search/src/main/java/dev/sonle/filmdb/search/listener/SearchRefreshListener.java) annotated with `@Async` and `@EventListener` to trigger the search view refresh concurrently on a background executor without blocking the pipeline progression.

### 3. Repository Layer with Raw SQL Control
Created [SearchRepository.java](file:///s:/Coding/Projects/film-db/modules/search/src/main/java/dev/sonle/filmdb/search/repository/SearchRepository.java) using Spring's `NamedParameterJdbcTemplate`.
- Runs SQL containing PostgreSQL's FTS search `@@` and `ts_rank_cd` operators.
- Computes relevance score as:
  $$\text{RelevanceScore} = \left(0.7 \times \text{ts\_rank\_cd}(\text{vector}, \text{query}) + 0.3 \times \text{similarity}(\text{title}, \text{query})\right) \times \text{popularity\_boost\_multiplier}$$
- Resolves mapping of result rows to search DTOs via a customized mapping function.

### 4. Service and Controller Layers
- **DTO Created**: [MovieSearchResultDto.java](file:///s:/Coding/Projects/film-db/modules/search/src/main/java/dev/sonle/filmdb/search/dto/MovieSearchResultDto.java) representing the output results.
- **Service Created**: [SearchService.java](file:///s:/Coding/Projects/film-db/modules/search/src/main/java/dev/sonle/filmdb/search/service/SearchService.java) managing pagination wrappers (`PageImpl`).
- **Endpoints Exposed**: Created [SearchController.java](file:///s:/Coding/Projects/film-db/modules/search/src/main/java/dev/sonle/filmdb/search/api/SearchController.java) mapping to:
  - `GET /api/v1/search`: paginated smart global English/Original search.
  - `GET /api/v1/search/live`: as-you-type smart global search.
  - `GET /api/v1/search/vn`: paginated Vietnamese localized search.
  - `GET /api/v1/search/vn/live`: as-you-type Vietnamese localized search.
- **Ambiguity Cleanup**: Deleted the dummy controller file `Hello.java` to prevent duplicate mapping exceptions during startup.
