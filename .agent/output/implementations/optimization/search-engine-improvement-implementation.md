# Search Engine Improvement Implementation

This document details the code updates applied to enhance and calibrate the `film-db` search engine module.

## User's intent

The goal was to implement the improvements specified in the search engine improvement plan:
1. **Materialized View Filtering**: Limit `search.movie_search` strictly to title types `'movie'`, `'short'`, and `'tvSeries'`.
2. **Double FTS Vectors & Stopword Preservation**: Introduce `main_simple_search_vector` using the `simple` configuration to preserve stopwords alongside the stemmed `main_search_vector`.
3. **Advanced Hybrid Relevance Scoring**: Update search queries to merge FTS English (20%), FTS Simple (40%), Trigram Similarity (40%), Prefix match bonus, and dynamic position-based Substring matching.
4. **Length-Gated and Scaled Bonuses**: Restrict prefix and position bonuses to queries with a length of 3 or more characters, and scale the bonuses according to the keyword length to prevent over-boosting short queries.
5. **Tiered Dampening Popularity Boost Model**: Replace the Bayesian model with a structured tiered system for $P(N)$, $W(N)$, and $Q(R)$ pre-computed inside the materialized view.
6. **Database Extension Schema Target**: Restrict the `pg_trgm` extension to the `public` schema.

---

## Results

We successfully implemented all the requested improvements:

### 1. Updated Database Migration
We updated [V6__create_movie_search.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db/migration/V6__create_movie_search.sql):
- **pg_trgm extension** is now explicitly loaded in the `public` schema.
- Added scope filtering: `WHERE m.title_type IN ('movie', 'short', 'tvSeries')`.
- Added the `main_simple_search_vector` using the `simple` dictionary configuration to retain stopwords like `"Your"` and `"The"`.
- Created a GIN index on `main_simple_search_vector` called `idx_movie_main_simple_search` to speed up simple matches.
- Encoded the **Tiered Dampening Model** for the `popularity_boost_multiplier` column using PostgreSQL nested `CASE WHEN` brackets to calculate the base popularity $P(N)$, dampening gate $W(N)$, and rating quality $Q(R)$ dynamically.

### 2. Refined Repository SQL Queries
We updated [SearchRepository.java](file:///s:/Coding/Projects/film-db/modules/search/src/main/java/dev/sonle/filmdb/search/repository/SearchRepository.java):
- Adjusted the text weights to 20% English FTS, 40% Simple FTS, and 40% Trigram Similarity for smart search.
- Added a gated and scaled prefix match check:
  `CASE WHEN length(q.literal_q) >= 3 AND lower(title) LIKE lower(q.literal_q) || '%' THEN 1.0 * q.length_scale ELSE 0.0 END`
- Added a gated and scaled substring position check:
  `CASE WHEN length(q.literal_q) >= 3 AND strpos(lower(title), lower(q.literal_q)) > 0 THEN (1.0 / strpos(lower(title), lower(q.literal_q))) * q.length_scale ELSE 0.0 END`
- Modified Vietnamese search to utilize 60% Simple FTS and 40% Trigram Similarity, along with gated and scaled Vietnamese prefix/substring position checks.
- Updated both live search queries (smart and Vietnamese) to compute similarity combined with gated and scaled prefix/position checks.
