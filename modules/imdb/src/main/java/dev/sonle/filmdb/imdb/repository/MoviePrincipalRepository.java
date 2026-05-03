package dev.sonle.filmdb.imdb.repository;

import dev.sonle.filmdb.imdb.model.MoviePrincipal;
import dev.sonle.filmdb.imdb.model.MoviePrincipalId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface MoviePrincipalRepository extends JpaRepository<MoviePrincipal, MoviePrincipalId> {

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.MoviePersonInfoDto(
        p.personId, p.primaryName, p.birthYear, p.deathYear, mp.category, mp.job, mp.characters
    )
    FROM MoviePrincipal mp
    JOIN mp.person p
    WHERE mp.movieId = :filmId
    ORDER BY mp.ordering
    """)
    List<dev.sonle.filmdb.imdb.dto.MoviePersonInfoDto> findPeopleByMovieId(@Param("filmId") String filmId);
}
