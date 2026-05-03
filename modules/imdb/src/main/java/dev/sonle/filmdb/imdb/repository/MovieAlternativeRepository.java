package dev.sonle.filmdb.imdb.repository;

import dev.sonle.filmdb.imdb.model.MovieAlternative;
import dev.sonle.filmdb.imdb.model.MovieAlternativeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieAlternativeRepository extends JpaRepository<MovieAlternative, MovieAlternativeId> {

    @Query("SELECT a FROM MovieAlternative a WHERE a.movieId = :movieId AND (a.isOriginalTitle IS NULL OR a.isOriginalTitle = false)")
    List<MovieAlternative> findAlternativesByMovieId(@Param("movieId") String movieId);

    @Query("SELECT a FROM MovieAlternative a WHERE a.movieId IN :movieIds AND (a.isOriginalTitle IS NULL OR a.isOriginalTitle = false)")
    List<MovieAlternative> findAlternativesByMovieIdIn(@Param("movieIds") List<String> movieIds);
}
