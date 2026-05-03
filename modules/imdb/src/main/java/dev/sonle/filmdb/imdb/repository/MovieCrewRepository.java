package dev.sonle.filmdb.imdb.repository;

import dev.sonle.filmdb.imdb.model.MovieCrew;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieCrewRepository extends JpaRepository<MovieCrew, String> {
}
