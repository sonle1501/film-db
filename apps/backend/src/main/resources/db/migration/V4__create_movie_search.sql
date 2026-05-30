CREATE SCHEMA IF NOT EXISTS search;

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
    
    COALESCE(string_agg(DISTINCT ma.title, ' '), '') as vietnamese_titles_concat,
    
    -- Main FTS Search Vector (English)
    (
        setweight(to_tsvector('english', COALESCE(m.primary_title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(m.original_title, '')), 'B')
    ) as main_search_vector,
    
    -- Main FTS Search Vector (Simple)
    (
        setweight(to_tsvector('simple', COALESCE(m.primary_title, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(m.original_title, '')), 'B')
    ) as main_simple_search_vector,
    
    -- Vietnamese FTS Search Vector
    (
        setweight(to_tsvector('simple', COALESCE(string_agg(DISTINCT ma.title, ' '), '')), 'A')
    ) as vietnamese_search_vector,
    
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

CREATE UNIQUE INDEX idx_movie_search_id ON search.movie_search(movie_id);

CREATE INDEX idx_movie_main_search ON search.movie_search USING gin(main_search_vector);
CREATE INDEX idx_movie_main_simple_search ON search.movie_search USING gin(main_simple_search_vector);
CREATE INDEX idx_movie_vietnamese_search ON search.movie_search USING gin(vietnamese_search_vector);

CREATE INDEX idx_movie_primary_title_trgm ON search.movie_search USING gin(primary_title gin_trgm_ops);
CREATE INDEX idx_movie_vietnamese_titles_trgm ON search.movie_search USING gin(vietnamese_titles_concat gin_trgm_ops);
