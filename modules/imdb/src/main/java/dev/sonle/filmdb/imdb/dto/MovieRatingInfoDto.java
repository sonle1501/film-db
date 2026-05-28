package dev.sonle.filmdb.imdb.dto;

import dev.sonle.filmdb.imdb.model.Movie;
import dev.sonle.filmdb.imdb.model.MovieRating;

import dev.sonle.filmdb.shared.MovieImageEnabled;

import java.util.List;

public record MovieRatingInfoDto(
        String movieId,
        String primaryTitle,
        String originalTitle,
        Boolean isAdult,
        Integer startYear,
        Integer runtimeMinutes,
        List<String> genres,
        java.math.BigDecimal averageRating,
        Integer numVotes
) implements MovieImageEnabled {
    public static MovieRatingInfoDto from(Movie m, MovieRating r){
        return new MovieRatingInfoDto(m.getMovieId(), m.getPrimaryTitle(), m.getOriginalTitle(), m.getIsAdult(), m.getStartYear(), m.getRuntimeMinutes(), m.getGenres(), r.getAverageRating(), r.getNumVotes());
    }
}
