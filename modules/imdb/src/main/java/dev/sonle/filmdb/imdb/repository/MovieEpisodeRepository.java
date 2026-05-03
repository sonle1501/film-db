package dev.sonle.filmdb.imdb.repository;

import dev.sonle.filmdb.imdb.dto.EpisodeInfoDto;
import dev.sonle.filmdb.imdb.model.MovieEpisode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface MovieEpisodeRepository extends JpaRepository<MovieEpisode, String> {

    @Query("SELECT MAX(e.seasonNumber) FROM MovieEpisode e WHERE e.parentMovieId = :filmId")
    Integer getNumberOfSeasons(@Param("filmId") String filmId);

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.EpisodeInfoDto(
        e.movieId, e.parentMovieId, e.seasonNumber, e.episodeNumber,
        m.primaryTitle, m.originalTitle, m.startYear, m.runtimeMinutes
    )
    FROM MovieEpisode e
    JOIN e.episode m
    WHERE e.parentMovieId = :filmId AND e.seasonNumber = :seasonNumber
    ORDER BY e.episodeNumber ASC
    """)
    List<EpisodeInfoDto> findEpisodesBySeason(@Param("filmId") String filmId, @Param("seasonNumber") Integer seasonNumber);

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.EpisodeInfoDto(
        e.movieId, e.parentMovieId, e.seasonNumber, e.episodeNumber,
        m.primaryTitle, m.originalTitle, m.startYear, m.runtimeMinutes
    )
    FROM MovieEpisode e
    JOIN e.episode m
    WHERE e.movieId = :episodeId
    """)
    Optional<EpisodeInfoDto> findEpisodeById(@Param("episodeId") String episodeId);
}
