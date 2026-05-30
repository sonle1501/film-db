-- Drop materialized view first since it depends on the active tables
DROP MATERIALIZED VIEW IF EXISTS search.movie_search CASCADE;

-- Swap tables
ALTER TABLE imdb.movie RENAME TO movie_old;
ALTER TABLE imdb.person RENAME TO person_old;
ALTER TABLE imdb.movie_alternative RENAME TO movie_alternative_old;
ALTER TABLE imdb.movie_crew RENAME TO movie_crew_old;
ALTER TABLE imdb.movie_episode RENAME TO movie_episode_old;
ALTER TABLE imdb.movie_principal RENAME TO movie_principal_old;
ALTER TABLE imdb.movie_rating RENAME TO movie_rating_old;

ALTER TABLE imdb.movie_staging RENAME TO movie;
ALTER TABLE imdb.person_staging RENAME TO person;
ALTER TABLE imdb.movie_alternative_staging RENAME TO movie_alternative;
ALTER TABLE imdb.movie_crew_staging RENAME TO movie_crew;
ALTER TABLE imdb.movie_episode_staging RENAME TO movie_episode;
ALTER TABLE imdb.movie_principal_staging RENAME TO movie_principal;
ALTER TABLE imdb.movie_rating_staging RENAME TO movie_rating;

ALTER TABLE imdb.movie_old RENAME TO movie_staging;
ALTER TABLE imdb.person_old RENAME TO person_staging;
ALTER TABLE imdb.movie_alternative_old RENAME TO movie_alternative_staging;
ALTER TABLE imdb.movie_crew_old RENAME TO movie_crew_staging;
ALTER TABLE imdb.movie_episode_old RENAME TO movie_episode_staging;
ALTER TABLE imdb.movie_principal_old RENAME TO movie_principal_staging;
ALTER TABLE imdb.movie_rating_old RENAME TO movie_rating_staging;


-- Rename indexes
ALTER INDEX imdb.idx_movie_type_year RENAME TO idx_movie_type_year_old;
ALTER INDEX imdb.idx_rating_votes_avg RENAME TO idx_rating_votes_avg_old;
ALTER INDEX imdb.idx_rating_avg_votes RENAME TO idx_rating_avg_votes_old;
ALTER INDEX imdb.idx_movie_episode_parent_season_number RENAME TO idx_movie_episode_parent_season_number_old;
ALTER INDEX imdb.idx_movie_genres_gin RENAME TO idx_movie_genres_gin_old;

ALTER INDEX imdb.idx_movie_type_year_staging RENAME TO idx_movie_type_year;
ALTER INDEX imdb.idx_rating_votes_avg_staging RENAME TO idx_rating_votes_avg;
ALTER INDEX imdb.idx_rating_avg_votes_staging RENAME TO idx_rating_avg_votes;
ALTER INDEX imdb.idx_movie_episode_parent_season_number_staging RENAME TO idx_movie_episode_parent_season_number;
ALTER INDEX imdb.idx_movie_genres_gin_staging RENAME TO idx_movie_genres_gin;

ALTER INDEX imdb.idx_movie_type_year_old RENAME TO idx_movie_type_year_staging;
ALTER INDEX imdb.idx_rating_votes_avg_old RENAME TO idx_rating_votes_avg_staging;
ALTER INDEX imdb.idx_rating_avg_votes_old RENAME TO idx_rating_avg_votes_staging;
ALTER INDEX imdb.idx_movie_episode_parent_season_number_old RENAME TO idx_movie_episode_parent_season_number_staging;
ALTER INDEX imdb.idx_movie_genres_gin_old RENAME TO idx_movie_genres_gin_staging;

-- Recreate materialized view
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
GROUP BY m.movie_id, r.average_rating, r.num_votes
WITH NO DATA;

CREATE UNIQUE INDEX idx_movie_search_id ON search.movie_search(movie_id);

CREATE INDEX idx_movie_main_search ON search.movie_search USING gin(main_search_vector);
CREATE INDEX idx_movie_main_simple_search ON search.movie_search USING gin(main_simple_search_vector);
CREATE INDEX idx_movie_vietnamese_search ON search.movie_search USING gin(vietnamese_search_vector);

CREATE INDEX idx_movie_primary_title_trgm ON search.movie_search USING gin(primary_title gin_trgm_ops);
CREATE INDEX idx_movie_vietnamese_titles_trgm ON search.movie_search USING gin(vietnamese_titles_concat gin_trgm_ops);
