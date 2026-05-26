-- Staging tables definition

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


