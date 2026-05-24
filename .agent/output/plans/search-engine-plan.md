# Search Engine Plan

This document details the architectural design, mathematical models, and implementation roadmap for building a search engine on the `film-db` project.

## User's intent

The goal is to build a robust, performant search engine module that integrates both PostgreSQL's native search features and custom ranking/weighting. The search engine must support three main features:
1. **Smart Search (Global)**: The most powerful and intelligent search mode, searching english and original titles with weighted rankings and typo tolerance.
2. **Localized Search (Vietnamese)**: A dedicated search mode targeting only movies that have Vietnamese alternative titles, allowing users to find movies by their Vietnamese names.
3. **Real-time / Live Search**: As-you-type search matching with limited results, optimized for low latency.

Additionally, this plan addresses:
- Separating the backend search indices so that the "Smart Search" and "Vietnamese Localized Search" remain distinct, matching the UX dropdown selection.
- Using FTS ranking (`ts_rank`) and `websearch_to_tsquery` to rank matches.
- Combining textual ranking with a mathematical popularity boost using ratings and vote counts.

---

## Results

### 1. Architectural Choice: Single vs. Two-Table Schema

To handle `movie_alternative` queries alongside main movie details, we can structure the `search` schema in two ways:

#### Option A: Single Denormalized Table/View (Recommended for Search Performance)
A single materialized view (`search.movie_search_index`) that aggregates all movie details, ratings, and concatenates alternative titles into a single row.
*   **Pros:**
    *   **Maximum Performance:** Queries perform a simple index-scan on a single table. No JOIN overhead at query time.
    *   **Simpler Indexing:** Allows creating separate pre-computed vectors for the different search modes in a single row.
*   **Cons:**
    *   Loses granular attributes of individual alternative records (such as specific region/language mapping) during general search.

#### Option B: Two separate tables (`search.movie` and `search.movie_alternative`)
We create two materialized views (or tables) in the `search` schema: one for main movie fields and ratings, and another for alternative titles.
*   **Pros:**
    *   **Relational separation:** Clean separation of data.
    *   **Metadata Filtering:** Easily supports queries like "Search alternative titles *only* in the US region".
*   **Cons:**
    *   **Performance Overhead:** Requires joining `search.movie` and `search.movie_alternative` on every query, which slows down the fuzzy trigram queries.

#### The Recommendation: Single Table/View with Weighted Vectors
We recommend **Option A** because we can achieve ranking isolation (ranking `primary_title` > `original_title` > `alternatives`) using PostgreSQL's native `setweight` feature inside a single denormalized table/view. This avoids the cost of joins during search.

---

### 2. Vietnamese-Specific Localized Search Re-design

By integrating a frontend dropdown, the search experience is split into two distinct modes:

1.  **Smart Search (Global English/Original):** Searches the original and primary titles using English stemming rules.
2.  **Vietnamese Localized Search (VN Only):** Searches only Vietnamese alternative titles using the Simple parser (which preserves Vietnamese syllable spelling without incorrect English suffix stemming).

To support this cleanly on the backend without performance loss, we store **two separate pre-computed search vectors** in our single materialized view:
-   `main_search_vector`: Pre-computed English FTS vector for `primary_title` and `original_title`.
-   `vietnamese_search_vector`: Pre-computed Simple FTS vector for Vietnamese alternative titles.

#### Updated Schema Definition
```sql
CREATE SCHEMA IF NOT EXISTS search;

CREATE MATERIALIZED VIEW search.movie_search_index AS
SELECT 
    m.movie_id,
    m.primary_title,
    m.original_title,
    m.title_type,
    m.start_year,
    m.genres,
    COALESCE(r.average_rating, 0.0) as average_rating,
    COALESCE(r.num_votes, 0) as num_votes,
    -- Pre-aggregate ONLY Vietnamese titles (Region = VN or Language = vi)
    COALESCE(string_agg(DISTINCT ma.title, ' ' FILTER (WHERE ma.title IS NOT NULL)), '') as vietnamese_titles_concat,
    -- 1. Main Search Vector: Primary (A, english), Original (B, english)
    (
        setweight(to_tsvector('english', COALESCE(m.primary_title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(m.original_title, '')), 'B')
    ) as main_search_vector,
    -- 2. Vietnamese Search Vector: Localized Title (A, simple)
    (
        setweight(to_tsvector('simple', COALESCE(string_agg(DISTINCT ma.title, ' ' FILTER (WHERE ma.title IS NOT NULL)), '')), 'A')
    ) as vietnamese_search_vector
FROM imdb.movie m
LEFT JOIN imdb.movie_rating r ON m.movie_id = r.movie_id
-- Pre-filter the JOIN for alternative titles to VN only
LEFT JOIN imdb.movie_alternative ma ON m.movie_id = ma.movie_id 
    AND (ma.region = 'VN' OR ma.language = 'vi' OR ma.language = 'vn')
GROUP BY m.movie_id, r.average_rating, r.num_votes;
```

#### Performance Indexes on the Materialized View
```sql
-- Unique index to support CONCURRENT refreshes
CREATE UNIQUE INDEX idx_movie_search_index_id ON search.movie_search_index(movie_id);

-- GIN Index for Smart Global Search FTS
CREATE INDEX idx_movie_main_search_vector ON search.movie_search_index USING gin(main_search_vector);

-- GIN Index for Localized Vietnamese Search FTS
CREATE INDEX idx_movie_vietnamese_search_vector ON search.movie_search_index USING gin(vietnamese_search_vector);

-- Trigram indexes for typo tolerance and live prefix matching
CREATE INDEX idx_movie_primary_title_trgm ON search.movie_search_index USING gin(primary_title gin_trgm_ops);
CREATE INDEX idx_movie_vietnamese_titles_trgm ON search.movie_search_index USING gin(vietnamese_titles_concat gin_trgm_ops);
```

---

### 3. FTS Ranking & `websearch_to_tsquery`

*   **Smart Search Weights:** We rank `primary_title` (Weight A) higher than `original_title` (Weight B).
*   **Query Parsing:** We use `websearch_to_tsquery` to parse search inputs. For Smart Search, we use the `english` parser configuration. For Vietnamese Localized Search, we use the `simple` parser configuration to avoid mangling Vietnamese characters/syllables.

---

### 4. Custom Weighting Model (Rating and Votes)

To boost matches based on movie quality and popularity, we apply a multiplicative boost factor:

$$\text{FinalScore} = S_{\text{text}} \times (1 + \text{QualityBoost})$$

Where:
*   $S_{\text{text}}$ is the text score computed by FTS/Trigram.
*   $\text{QualityBoost} = 0.20 \cdot \left(\frac{\text{average\_rating}}{10.0}\right) + 0.20 \cdot \min\left(1.0, \frac{\log_{10}(\text{num\_votes} + 1)}{\log_{10}(50001)}\right)$

---

### 5. Search Features Implementation Details

Based on the frontend dropdown selection, the backend will route the request to one of the following specialized queries:

#### Feature A: Smart Search (Global English/Original Titles)
Searches the `main_search_vector` and uses trigram matching on the `primary_title`.

**SQL Example:**
```sql
WITH search_query AS (
    SELECT websearch_to_tsquery('english', :query) as ts_q, :query as literal_q
)
SELECT 
    m.movie_id, 
    m.primary_title, 
    m.original_title, 
    m.start_year, 
    m.genres, 
    m.average_rating,
    -- Compute base text score (FTS rank + Trigram similarity on primary title)
    (
        ts_rank_cd(m.main_search_vector, q.ts_q) * 0.7 + 
        similarity(m.primary_title, q.literal_q) * 0.3
    ) as base_text_score,
    -- Apply Quality Boost Multiplier
    (
        1.0 + 
        (0.20 * (m.average_rating / 10.0)) + 
        (0.20 * LEAST(1.0, log(10, m.num_votes + 1) / log(10, 50001)))
    ) as boost_multiplier
FROM search.movie_search_index m, search_query q
WHERE m.main_search_vector @@ q.ts_q
   OR m.primary_title % q.literal_q
ORDER BY (base_text_score * boost_multiplier) DESC
LIMIT :limit;
```

#### Feature B: Localized Search (Vietnamese Movie Names Only)
Strictly searches the `vietnamese_search_vector` and uses trigram matching on `vietnamese_titles_concat`. Movies without a Vietnamese title will not be returned by this search mode.

**SQL Example:**
```sql
WITH search_query AS (
    SELECT websearch_to_tsquery('simple', :query) as ts_q, :query as literal_q
)
SELECT 
    m.movie_id, 
    m.primary_title, 
    m.vietnamese_titles_concat,
    -- Base score focused entirely on Vietnamese titles
    (
        ts_rank_cd(m.vietnamese_search_vector, q.ts_q) * 0.7 + 
        similarity(m.vietnamese_titles_concat, q.literal_q) * 0.3
    ) as base_text_score,
    (
        1.0 + 
        (0.20 * (m.average_rating / 10.0)) + 
        (0.20 * LEAST(1.0, log(10, m.num_votes + 1) / log(10, 50001)))
    ) as boost_multiplier
FROM search.movie_search_index m, search_query q
WHERE m.vietnamese_search_vector @@ q.ts_q
   OR m.vietnamese_titles_concat % q.literal_q
ORDER BY (base_text_score * boost_multiplier) DESC
LIMIT :limit;
```

#### Feature C: Real-time / Live Search (Search-As-You-Type)
Utilizes the current dropdown value to execute a prefix/trigram scan on the matching field.

**SQL Example (If Vietnamese Search is selected in dropdown):**
```sql
SELECT 
    movie_id, 
    primary_title, 
    vietnamese_titles_concat as matching_title,
    start_year, 
    average_rating
FROM search.movie_search_index
WHERE vietnamese_titles_concat ILIKE :prefix_query  -- e.g., 'Bố già%'
   OR similarity(vietnamese_titles_concat, :query) > 0.4
ORDER BY num_votes DESC, average_rating DESC
LIMIT 5;
```

**SQL Example (If Smart Search is selected in dropdown):**
```sql
SELECT 
    movie_id, 
    primary_title, 
    primary_title as matching_title,
    start_year, 
    average_rating
FROM search.movie_search_index
WHERE primary_title ILIKE :prefix_query  -- e.g., 'Toy St%'
   OR similarity(primary_title, :query) > 0.4
ORDER BY num_votes DESC, average_rating DESC
LIMIT 5;
```
