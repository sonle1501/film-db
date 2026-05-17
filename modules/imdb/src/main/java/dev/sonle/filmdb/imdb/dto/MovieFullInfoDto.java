package dev.sonle.filmdb.imdb.dto;

import dev.sonle.filmdb.imdb.model.Movie;
import dev.sonle.filmdb.imdb.model.MovieAlternative;
import dev.sonle.filmdb.imdb.model.MovieRating;

import java.util.List;

public record MovieFullInfoDto(
        String movieId,
        String primaryTitle,
        String originalTitle,
        Boolean isAdult,
        Integer startYear,
        Integer runtimeMinutes,
        List<String> genres,
        java.math.BigDecimal averageRating,
        Integer numVotes,
        List<MoviePersonInfoDto> persons
) {
    public static MovieFullInfoDto from(MovieRatingInfoDto m, List<MoviePersonInfoDto> persons) {
        return new MovieFullInfoDto(
                m.movieId(),
                m.primaryTitle(),
                m.originalTitle(),
                m.isAdult(),
                m.startYear(),
                m.runtimeMinutes(),
                m.genres(),
                m.averageRating(),
                m.numVotes(),
                persons
        );
    }
}
