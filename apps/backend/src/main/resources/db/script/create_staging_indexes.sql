CREATE INDEX IF NOT EXISTS idx_movie_type_year_staging ON imdb.movie_staging (title_type, start_year);
CREATE INDEX IF NOT EXISTS idx_rating_votes_avg_staging ON imdb.movie_rating_staging (num_votes DESC, average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_rating_avg_votes_staging ON imdb.movie_rating_staging (average_rating DESC, num_votes DESC);
CREATE INDEX IF NOT EXISTS idx_movie_episode_parent_season_number_staging ON imdb.movie_episode_staging (parent_movie_id, season_number, episode_number ASC);
CREATE INDEX IF NOT EXISTS idx_movie_genres_gin_staging ON imdb.movie_staging USING GIN (genres);
