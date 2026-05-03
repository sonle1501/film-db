-- use prefix `imdb` represent for schema name
-- person (name.basics.tsv.gz)
-- actors, directors, etc.
CREATE TABLE imdb.person (
                             person_id VARCHAR(15) PRIMARY KEY, -- Renamed from nconst
                             primary_name TEXT NOT NULL,
                             birth_year INTEGER,
                             death_year INTEGER,
                             primary_profession TEXT[],
                             known_for_titles TEXT[] -- Array of movie_ids
);

-- movie (title.basics.tsv.gz)
CREATE TABLE imdb.movie (
                            movie_id VARCHAR(15) PRIMARY KEY, -- Renamed from tconst
                            title_type VARCHAR(50),
                            primary_title TEXT,
                            original_title TEXT,
                            is_adult BOOLEAN, -- 0/1 as boolean
                            start_year INTEGER,
                            end_year INTEGER,
                            runtime_minutes INTEGER,
                            genres TEXT[] -- Up to 3 genres
);

-- movie_alternative (title.akas.tsv.gz)
-- Alternative titles, regions, and translations.
CREATE TABLE imdb.movie_alternative (
                                        movie_id VARCHAR(15), -- Renamed from titleId
                                        ordering INTEGER,
                                        title TEXT,
                                        region VARCHAR(10),
                                        language VARCHAR(20),
                                        types TEXT[],
                                        attributes TEXT[],
                                        is_original_title BOOLEAN,
                                        PRIMARY KEY (movie_id, ordering)
);

-- movie_crew (title.crew.tsv.gz)
-- Directors and writers linked to titles.
CREATE TABLE imdb.movie_crew (
                                 movie_id VARCHAR(15) PRIMARY KEY, -- Renamed from tconst
                                 directors TEXT[], -- arr of person_ids
                                 writers TEXT[]    -- arr of person_ids
);

-- 5. movie_episode (title.episode.tsv.gz)
CREATE TABLE imdb.movie_episode (
                                    movie_id VARCHAR(15) PRIMARY KEY, -- Renamed from tconst
                                    parent_movie_id VARCHAR(15),      -- Renamed from parentTconst
                                    season_number INTEGER,
                                    episode_number INTEGER
);

-- movie_principal (title.principals.tsv.gz)
-- The main cast and crew for a title.
CREATE TABLE imdb.movie_principal (
                                      movie_id VARCHAR(15), -- Renamed from tconst
                                      ordering INTEGER,
                                      person_id VARCHAR(15), -- Renamed from nconst
                                      category VARCHAR(100),
                                      job TEXT,
                                      characters TEXT,
                                      PRIMARY KEY (movie_id, ordering)
);

-- movie_rating (Source: title.ratings.tsv.gz)
CREATE TABLE imdb.movie_rating (
                                   movie_id VARCHAR(15) PRIMARY KEY, -- Renamed from tconst
                                   average_rating NUMERIC(3,1),
                                   num_votes INTEGER
);