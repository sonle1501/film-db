
-- 1. Create main tables for imdb schema
CREATE TABLE imdb.person (
    person_id VARCHAR(15) PRIMARY KEY,
    primary_name TEXT,
    birth_year INTEGER,
    death_year INTEGER,
    primary_profession TEXT[],
    known_for_titles TEXT[]
);

CREATE TABLE imdb.movie (
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

CREATE TABLE imdb.movie_alternative (
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

CREATE TABLE imdb.movie_crew (
    movie_id VARCHAR(15) PRIMARY KEY,
    directors TEXT[],
    writers TEXT[]
);

CREATE TABLE imdb.movie_episode (
    movie_id VARCHAR(15) PRIMARY KEY,
    parent_movie_id VARCHAR(15),
    season_number INTEGER,
    episode_number INTEGER
);

CREATE TABLE imdb.movie_principal (
    movie_id VARCHAR(15),
    ordering INTEGER,
    person_id VARCHAR(15),
    category VARCHAR(100),
    job TEXT,
    characters TEXT,
    PRIMARY KEY (movie_id, ordering)
);

CREATE TABLE imdb.movie_rating (
    movie_id VARCHAR(15) PRIMARY KEY,
    average_rating NUMERIC(3,1),
    num_votes INTEGER
);

-- 2. Create base indexes on active tables to support initial queries and the staging rename swap
CREATE INDEX IF NOT EXISTS idx_movie_type_year ON imdb.movie (title_type, start_year);
CREATE INDEX IF NOT EXISTS idx_rating_votes_avg ON imdb.movie_rating (num_votes DESC, average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_rating_avg_votes ON imdb.movie_rating (average_rating DESC, num_votes DESC);
CREATE INDEX IF NOT EXISTS idx_movie_episode_parent_season_number ON imdb.movie_episode (parent_movie_id, season_number, episode_number ASC);
CREATE INDEX IF NOT EXISTS idx_movie_genres_gin ON imdb.movie USING GIN (genres);

