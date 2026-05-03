package dev.sonle.filmdb.imdb.repository;

import dev.sonle.filmdb.imdb.model.MovieRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRatingRepository extends JpaRepository<MovieRating, String> {

}
