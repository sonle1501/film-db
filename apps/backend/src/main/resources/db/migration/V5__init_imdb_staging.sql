-- 1. Create staging tables
CREATE TABLE imdb.person_staging (
    person_id VARCHAR(15) PRIMARY KEY,
    primary_name TEXT,
    birth_year INTEGER,
    death_year INTEGER,
    primary_profession TEXT[],
    known_for_titles TEXT[]
);

CREATE TABLE imdb.movie_staging (
    movie_id VARCHAR(15) PRIMARY KEY,
    title_type VARCHAR(50),
    primary_title TEXT,
    original_title TEXT,
    is_adult BOOLEAN,
    start_year INTEGER,
    end_year INTEGER,
    runtime_minutes INTEGER,
    genres TEXT[]
);

CREATE TABLE imdb.movie_alternative_staging (
    movie_id VARCHAR(15),
    ordering INTEGER,
    title TEXT,
    region VARCHAR(10),
    language VARCHAR(20),
    types TEXT[],
    attributes TEXT[],
    is_original_title BOOLEAN,
    PRIMARY KEY (movie_id, ordering)
);

CREATE TABLE imdb.movie_crew_staging (
    movie_id VARCHAR(15) PRIMARY KEY,
    directors TEXT[],
    writers TEXT[]
);

CREATE TABLE imdb.movie_episode_staging (
    movie_id VARCHAR(15) PRIMARY KEY,
    parent_movie_id VARCHAR(15),
    season_number INTEGER,
    episode_number INTEGER
);

CREATE TABLE imdb.movie_principal_staging (
    movie_id VARCHAR(15),
    ordering INTEGER,
    person_id VARCHAR(15),
    category VARCHAR(100),
    job TEXT,
    characters TEXT,
    PRIMARY KEY (movie_id, ordering)
);

CREATE TABLE imdb.movie_rating_staging (
    movie_id VARCHAR(15) PRIMARY KEY,
    average_rating NUMERIC(3,1),
    num_votes INTEGER
);

-- 2. Create base indexes on staging tables
CREATE INDEX IF NOT EXISTS idx_movie_type_year_staging ON imdb.movie_staging (title_type, start_year);
CREATE INDEX IF NOT EXISTS idx_rating_votes_avg_staging ON imdb.movie_rating_staging (num_votes DESC, average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_rating_avg_votes_staging ON imdb.movie_rating_staging (average_rating DESC, num_votes DESC);
CREATE INDEX IF NOT EXISTS idx_movie_episode_parent_season_number_staging ON imdb.movie_episode_staging (parent_movie_id, season_number, episode_number ASC);
CREATE INDEX IF NOT EXISTS idx_movie_genres_gin_staging ON imdb.movie_staging USING GIN (genres);
