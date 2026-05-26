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
