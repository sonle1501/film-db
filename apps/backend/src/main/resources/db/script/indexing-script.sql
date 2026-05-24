CREATE INDEX idx_movie_type_year 
ON imdb.movie (title_type, start_year);

CREATE INDEX idx_rating_votes_avg 
ON imdb.movie_rating (num_votes DESC, average_rating DESC);

CREATE INDEX idx_rating_avg_votes 
ON imdb.movie_rating (average_rating DESC, num_votes DESC);

CREATE INDEX idx_movie_episode_parent_season_number 
ON imdb.movie_episode (parent_movie_id, season_number, episode_number ASC);

CREATE INDEX idx_movie_genres_gin ON imdb.movie USING GIN (genres);