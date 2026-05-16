package dev.sonle.filmdb.imdb.repository;

import dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto;
import dev.sonle.filmdb.imdb.dto.MovieRatingInfoDto;
import dev.sonle.filmdb.imdb.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, String> {
    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.MovieRatingInfoDto(
        m.movieId,
        m.primaryTitle,
        m.originalTitle,
        m.isAdult,
        m.startYear,
        m.runtimeMinutes,
        m.genres,
        r.averageRating,
        r.numVotes
     )
    FROM Movie m
    INNER JOIN MovieRating r ON m.movieId= r.movieId
    WHERE m.movieId = :filmId
""")
    Optional<MovieRatingInfoDto> getMovieRatingInfoDto(@Param("filmId") String filmId);

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.MovieRatingInfoDto(
        m.movieId,
        m.primaryTitle,
        m.originalTitle,
        m.isAdult,
        m.startYear,
        m.runtimeMinutes,
        m.genres,
        r.averageRating,
        r.numVotes
     )
    FROM Movie m
    INNER JOIN MovieRating r ON m.movieId= r.movieId
    WHERE r.averageRating >= :rating
""")
    List<MovieRatingInfoDto> getListMovieRatingInfoDto(@Param("rating") double rating);

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto(
        m.movieId, m.primaryTitle, m.originalTitle, m.isAdult, m.startYear, m.runtimeMinutes, m.genres
    )
    FROM Movie m
    WHERE LOWER(m.primaryTitle) = LOWER(:name)
       OR LOWER(m.originalTitle) = LOWER(:name)
    """)
    List<MovieBasicInfoDto> findByName(@Param("name") String name);

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto(
        m.movieId, m.primaryTitle, m.originalTitle, m.isAdult, m.startYear, m.runtimeMinutes, m.genres
    )
    FROM Movie m
    WHERE LOWER(m.primaryTitle) = LOWER(:name)
       OR LOWER(m.originalTitle) = LOWER(:name)
    """)
    Page<MovieBasicInfoDto> findByName(@Param("name") String name, Pageable pageable);

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto(
        m.movieId, m.primaryTitle, m.originalTitle, m.isAdult, m.startYear, m.runtimeMinutes, m.genres
    )
    FROM Movie m
    WHERE (LOWER(m.primaryTitle) = LOWER(:name) OR LOWER(m.originalTitle) = LOWER(:name))
      AND m.titleType = :type
    """)
    List<MovieBasicInfoDto> findByNameAndType(@Param("name") String name, @Param("type") String type);

    @Query(value = """
    SELECT *
    FROM movie m
    WHERE (LOWER(m.primary_title) = LOWER(:name) OR LOWER(m.original_title) = LOWER(:name))
      AND :genre = ANY(m.genres)
    """, nativeQuery = true)
    List<Movie> findByNameAndGenre(@Param("name") String name, @Param("genre") String genre);

    @Query("""
    SELECT DISTINCT new dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto(
        m.movieId, m.primaryTitle, m.originalTitle, m.isAdult, m.startYear, m.runtimeMinutes, m.genres
    )
    FROM Movie m JOIN m.movieAlternatives a
    WHERE LOWER(a.title) = LOWER(:name)
    """)
    List<MovieBasicInfoDto> findByLocalizedName(@Param("name") String name);

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto(
        m.movieId, m.primaryTitle, m.originalTitle, m.isAdult, m.startYear, m.runtimeMinutes, m.genres
    )
    FROM Movie m
    WHERE m.startYear >= :year ORDER BY m.startYear DESC
    """)
    List<MovieBasicInfoDto> findRecentMovies(@Param("year") int year);

    @Query("""
    SELECT DISTINCT new dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto(
        m.movieId, m.primaryTitle, m.originalTitle, m.isAdult, m.startYear, m.runtimeMinutes, m.genres
    )
    FROM MoviePrincipal mp
    JOIN mp.movie m
    WHERE mp.personId = :personId
    """)
    List<dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto> findCareerMoviesByPersonId(@Param("personId") String personId);

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto(
        m.movieId, m.primaryTitle, m.originalTitle, m.isAdult, m.startYear, m.runtimeMinutes, m.genres
    )
    FROM Movie m
    WHERE m.movieId IN :movieIds
    """)
    List<MovieBasicInfoDto> findBasicInfoByIds(@Param("movieIds") List<String> movieIds);

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto(
        m.movieId, m.primaryTitle, m.originalTitle, m.isAdult, m.startYear, m.runtimeMinutes, m.genres
    )
    FROM Movie m
    WHERE (LOWER(m.primaryTitle) = LOWER(:name) OR LOWER(m.originalTitle) = LOWER(:name))
      AND m.titleType = 'tvSeries'
    """)
    List<MovieBasicInfoDto> findTvSeriesByName(@Param("name") String name);

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.MovieRatingInfoDto(
        m.movieId,
        m.primaryTitle,
        m.originalTitle,
        m.isAdult,
        m.startYear,
        m.runtimeMinutes,
        m.genres,
        r.averageRating,
        r.numVotes
     )
    FROM Movie m
    INNER JOIN MovieRating r ON m.movieId = r.movieId
    WHERE m.titleType = :type AND r.numVotes > :minVotes
    ORDER BY r.averageRating DESC
    """)
    List<MovieRatingInfoDto> findTopRatedByTypeAndMinVotes(@Param("type") String type, @Param("minVotes") int minVotes, Pageable pageable);

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.MovieRatingInfoDto(
        m.movieId,
        m.primaryTitle,
        m.originalTitle,
        m.isAdult,
        m.startYear,
        m.runtimeMinutes,
        m.genres,
        r.averageRating,
        r.numVotes
     )
    FROM Movie m
    INNER JOIN MovieRating r ON m.movieId = r.movieId
    WHERE m.titleType = :type
    ORDER BY r.numVotes DESC
    """)
    List<MovieRatingInfoDto> findMostPopularByType(@Param("type") String type, Pageable pageable);
}
