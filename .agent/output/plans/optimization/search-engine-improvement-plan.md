# Search Engine Improvement Plan

This document details the refined technical design, mathematical formulas, and step-by-step implementation roadmap for the improved `film-db` search engine.

## User's intent

The user wants to re-design and improve the search engine based on a new scoring concept:
1. **Materialized View Filtering**: Limit the `search.movie_search` view to catalog items of types `'movie'`, `'short'`, and `'tvSeries'`.
2. **Robust Multi-Vector Text Scoring**:
   - Combine standard English stemming FTS (`Rank_english`) with literal simple FTS (`Rank_simple`) to preserve stopwords.
   - Combine with Trigram similarity (`Sim_trgm`) for typo tolerance.
   - Add a prefix match bonus if the title starts with the raw query.
   - Add a dynamic position-based substring bonus ($1.0 / \text{position}$) to prioritize matches appearing earlier in the title.
3. **Bonus score Calibrations (Length Gating and Scaling)**:
   - To avoid over-boosting short, ambiguous terms, **only activate prefix and position bonuses when the search query is 3 or more characters long** (`length(q.literal_q) >= 3`).
   - **Scale the bonus** by the query length using the factor $\min(1.0, \text{length(query)} / 10.0)$, so longer, more specific queries receive a larger relative boost.
4. **Tiered Dampening Popularity Boost Model**:
   - Replace the Bayesian rating model with a structured, deterministic tiered model.
   - Define a granular base popularity score $P(N)$ across specific brackets of vote count $N$.
   - Control the influence of ratings via a Dynamic Dampening Gate Switch $W(N)$ based on vote brackets.
   - Map rating values to a Rating Quality modifier $Q(R)$ supporting penalties for low ratings ($R < 3.0$).
5. **Database Extension Safety**: Ensure pg_trgm and similarity checks are safe against search path issues during schema migrations.

---

## Results

### 1. Database Schema and Indexes Migration

We will create a new Flyway migration script `V6__create_movie_search.sql` inside `apps/backend/src/main/resources/db/migration/`.

#### Key Improvements:
- **Filtered Scope**: Restricts rows to `movie`, `short`, and `tvSeries`.
- **Double Main FTS Vectors**: Precomputes `main_search_vector` (`english` stemming) and `main_simple_search_vector` (`simple` literal preservation of stopwords).
- **Extension Schema Specification**: Restricts the extension to the `public` schema.

```sql
-- Create search schema if not exists
CREATE SCHEMA IF NOT EXISTS search;

-- Enable trigram extension for typo tolerance explicitly in the public schema
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA public;

-- Create movie search materialized view
CREATE MATERIALIZED VIEW search.movie_search AS
SELECT 
    m.movie_id,
    m.primary_title,
    m.original_title,
    m.title_type,
    m.start_year,
    m.genres,
    COALESCE(r.average_rating, 0.0) as average_rating,
    COALESCE(r.num_votes, 0) as num_votes,
    
    -- Pre-aggregate Vietnamese localized titles (Region is VN or language matches Vietnamese)
    COALESCE(string_agg(DISTINCT ma.title, ' ' FILTER (WHERE ma.title IS NOT NULL)), '') as vietnamese_titles_concat,
    
    -- 1. Main FTS Search Vector (English): Primary Title (Weight A), Original Title (Weight B)
    (
        setweight(to_tsvector('english', COALESCE(m.primary_title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(m.original_title, '')), 'B')
    ) as main_search_vector,
    
    -- 2. Main FTS Search Vector (Simple): Primary Title (Weight A), Original Title (Weight B)
    (
        setweight(to_tsvector('simple', COALESCE(m.primary_title, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(m.original_title, '')), 'B')
    ) as main_simple_search_vector,
    
    -- 3. Vietnamese FTS Search Vector (Simple): Vietnamese Titles (Weight A)
    (
        setweight(to_tsvector('simple', COALESCE(string_agg(DISTINCT ma.title, ' ' FILTER (WHERE ma.title IS NOT NULL)), '')), 'A')
    ) as vietnamese_search_vector,
    
    -- 4. Pre-computed Custom Popularity Boost Multiplier using the Tiered Dampening Model
    (
        -- Popularity Base Score P(N)
        (CASE 
            WHEN COALESCE(r.num_votes, 0) < 100 THEN 0.10
            WHEN COALESCE(r.num_votes, 0) < 300 THEN 0.25
            WHEN COALESCE(r.num_votes, 0) < 500 THEN 0.40
            WHEN COALESCE(r.num_votes, 0) < 1000 THEN 0.60
            WHEN COALESCE(r.num_votes, 0) < 5000 THEN 0.80
            WHEN COALESCE(r.num_votes, 0) < 10000 THEN 1.00
            ELSE 1.20 + LEAST(1.8, log(10.0, COALESCE(r.num_votes, 0) / 10000.0) / log(10.0, 100.0))
         END) 
        + 
        -- Dynamic Dampening Gate W(N) * Rating Quality Factor Q(R)
        ((CASE 
            WHEN COALESCE(r.num_votes, 0) < 100 THEN 0.0
            WHEN COALESCE(r.num_votes, 0) < 500 THEN 0.3
            WHEN COALESCE(r.num_votes, 0) < 5000 THEN 0.6
            ELSE 1.0
          END) 
         * 
         (CASE 
            WHEN COALESCE(r.average_rating, 0.0) < 3.0 THEN -0.20
            WHEN COALESCE(r.average_rating, 0.0) < 4.0 THEN 0.05
            WHEN COALESCE(r.average_rating, 0.0) < 5.0 THEN 0.15
            ELSE 0.30
          END))
    ) as popularity_boost_multiplier
FROM imdb.movie m
LEFT JOIN imdb.movie_rating r ON m.movie_id = r.movie_id
LEFT JOIN imdb.movie_alternative ma ON m.movie_id = ma.movie_id 
    AND (ma.region = 'VN' OR ma.language = 'vi' OR ma.language = 'vn')
WHERE m.title_type IN ('movie', 'short', 'tvSeries')
GROUP BY m.movie_id, r.average_rating, r.num_votes;

-- Unique index required for CONCURRENT materialized view refreshes
CREATE UNIQUE INDEX idx_movie_search_id ON search.movie_search(movie_id);

-- GIN indexes for Full Text Search
CREATE INDEX idx_movie_main_search ON search.movie_search USING gin(main_search_vector);
CREATE INDEX idx_movie_main_simple_search ON search.movie_search USING gin(main_simple_search_vector);
CREATE INDEX idx_movie_vietnamese_search ON search.movie_search USING gin(vietnamese_search_vector);

-- Trigram GIN indexes for typo tolerance and suffix/prefix matching
CREATE INDEX idx_movie_primary_title_trgm ON search.movie_search USING gin(primary_title gin_trgm_ops);
CREATE INDEX idx_movie_vietnamese_titles_trgm ON search.movie_search USING gin(vietnamese_titles_concat gin_trgm_ops);
```

---

### 2. Refining Relevance Scoring Queries

We will update the native SQL queries executed by the search repository to apply length-gated and length-scaled bonuses.

#### A. Smart Search scoring
The text score incorporates a hybrid multi-vector representation:
$$\text{TextScore} = 0.2 \cdot \text{Rank}_{\text{english}} + 0.4 \cdot \text{Rank}_{\text{simple}} + 0.4 \cdot \text{Sim}_{\text{trgm}} + \text{Bonus}_{\text{prefix\_scaled}} + \text{Bonus}_{\text{position\_scaled}}$$

- **Query-Length Scale Factor**: $\min(1.0, \text{length}(query) / 10.0)$.
- **Gated Threshold**: Only applied if `length(query) >= 3`.

```sql
WITH q AS (
    SELECT 
        websearch_to_tsquery('english', :query) as ts_q_eng,
        websearch_to_tsquery('simple', :query) as ts_q_simp,
        :query as literal_q,
        LEAST(1.0, length(:query) / 10.0) as length_scale
)
SELECT 
    m.movie_id, 
    m.primary_title, 
    m.original_title, 
    m.title_type, 
    m.start_year, 
    m.genres, 
    m.average_rating, 
    m.num_votes,
    (
        0.2 * ts_rank_cd(m.main_search_vector, q.ts_q_eng) + 
        0.4 * ts_rank_cd(m.main_simple_search_vector, q.ts_q_simp) + 
        0.4 * similarity(m.primary_title, q.literal_q) +
        -- Gated and scaled Prefix Match Bonus (+1.0 max)
        (CASE 
            WHEN length(q.literal_q) >= 3 AND lower(m.primary_title) LIKE lower(q.literal_q) || '%' 
            THEN 1.0 * q.length_scale 
            ELSE 0.0 
         END) +
        -- Gated and scaled Position Substring Bonus
        (CASE 
            WHEN length(q.literal_q) >= 3 AND strpos(lower(m.primary_title), lower(q.literal_q)) > 0 
            THEN (1.0 / strpos(lower(m.primary_title), lower(q.literal_q))) * q.length_scale 
            ELSE 0.0 
         END)
    ) * m.popularity_boost_multiplier as relevance_score
FROM search.movie_search m, q
WHERE m.main_search_vector @@ q.ts_q_eng
   OR m.main_simple_search_vector @@ q.ts_q_simp
   OR m.primary_title % q.literal_q
ORDER BY relevance_score DESC
LIMIT :limit OFFSET :offset;
```

#### B. Vietnamese Search scoring
We adapt the model for localized search:
$$\text{TextScore}_{\text{vn}} = 0.6 \cdot \text{Rank}_{\text{simple}} + 0.4 \cdot \text{Sim}_{\text{trgm}} + \text{Bonus}_{\text{prefix\_scaled}} + \text{Bonus}_{\text{position\_scaled}}$$

```sql
WITH q AS (
    SELECT 
        websearch_to_tsquery('simple', :query) as ts_q,
        :query as literal_q,
        LEAST(1.0, length(:query) / 10.0) as length_scale
)
SELECT 
    m.movie_id, 
    m.primary_title, 
    m.original_title, 
    m.title_type, 
    m.start_year, 
    m.genres, 
    m.average_rating, 
    m.num_votes,
    (
        0.6 * ts_rank_cd(m.vietnamese_search_vector, q.ts_q) + 
        0.4 * similarity(m.vietnamese_titles_concat, q.literal_q) +
        (CASE 
            WHEN length(q.literal_q) >= 3 AND lower(m.vietnamese_titles_concat) LIKE lower(q.literal_q) || '%' 
            THEN 1.0 * q.length_scale 
            ELSE 0.0 
         END) +
        (CASE 
            WHEN length(q.literal_q) >= 3 AND strpos(lower(m.vietnamese_titles_concat), lower(q.literal_q)) > 0 
            THEN (1.0 / strpos(lower(m.vietnamese_titles_concat), lower(q.literal_q))) * q.length_scale 
            ELSE 0.0 
         END)
    ) * m.popularity_boost_multiplier as relevance_score
FROM search.movie_search m, q
WHERE m.vietnamese_search_vector @@ q.ts_q
   OR m.vietnamese_titles_concat % q.literal_q
ORDER BY relevance_score DESC
LIMIT :limit OFFSET :offset;
```

#### C. Smart Live Search query
```sql
SELECT 
    movie_id, primary_title, original_title, title_type, start_year, genres, average_rating, num_votes,
    (
        0.5 * similarity(primary_title, :query) +
        (CASE 
            WHEN length(:query) >= 3 AND lower(primary_title) LIKE lower(:query) || '%' 
            THEN 1.0 * LEAST(1.0, length(:query) / 10.0) 
            ELSE 0.0 
         END) +
        (CASE 
            WHEN length(:query) >= 3 AND strpos(lower(primary_title), lower(:query)) > 0 
            THEN (1.0 / strpos(lower(primary_title), lower(:query))) * LEAST(1.0, length(:query) / 10.0) 
            ELSE 0.0 
         END)
    ) * popularity_boost_multiplier as relevance_score
FROM search.movie_search
WHERE primary_title ILIKE :prefix_query
   OR primary_title % :query
ORDER BY relevance_score DESC, num_votes DESC
LIMIT :limit;
```

#### D. Vietnamese Live Search query
```sql
SELECT 
    movie_id, primary_title, original_title, title_type, start_year, genres, average_rating, num_votes,
    (
        0.5 * similarity(vietnamese_titles_concat, :query) +
        (CASE 
            WHEN length(:query) >= 3 AND lower(vietnamese_titles_concat) LIKE lower(:query) || '%' 
            THEN 1.0 * LEAST(1.0, length(:query) / 10.0) 
            ELSE 0.0 
         END) +
        (CASE 
            WHEN length(:query) >= 3 AND strpos(lower(vietnamese_titles_concat), lower(:query)) > 0 
            THEN (1.0 / strpos(lower(vietnamese_titles_concat), lower(:query))) * LEAST(1.0, length(:query) / 10.0) 
            ELSE 0.0 
         END)
    ) * popularity_boost_multiplier as relevance_score
FROM search.movie_search
WHERE vietnamese_titles_concat ILIKE :prefix_query
   OR vietnamese_titles_concat % :query
ORDER BY relevance_score DESC, num_votes DESC
LIMIT :limit;
```

---

## Verification Plan

### Automated Verification
1. **Compilation & Build**:
   Run `./gradlew :modules:search:build` and `./gradlew :apps:backend:build` to verify Gradle compiles successfully.
2. **Flyway Migration Check**:
   Apply migrations to verify schema and extension creation works correctly.

### Manual Verification
1. **Calibration Test for `"Your name"`**:
   Verify that *Your Name* now ranks above *Naming Names* when searching for `"Your name"`.
2. **Query length gating check**:
   Search for a 2-letter query like `"Yo"`. Verify that FTS and Trigram rank matching determines ordering, but prefix/position bonuses remain inactive to prevent over-boosting.
3. **Filter verification**:
   Query `search.movie_search` to verify only `movie`, `short`, and `tvSeries` types exist.
