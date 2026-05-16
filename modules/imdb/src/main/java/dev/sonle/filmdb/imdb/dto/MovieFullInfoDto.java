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
        List<MovieSupplementInfoDto.LocalizedTitle> localizedTitles
) {
    public static MovieFullInfoDto from(Movie m, MovieRating r, List<MovieAlternative> alternatives) {
        List<MovieSupplementInfoDto.LocalizedTitle> localized = alternatives != null ? alternatives.stream()
                .map(a -> new MovieSupplementInfoDto.LocalizedTitle(a.getTitle(), a.getLanguage()))
                .toList() : List.of();

        return new MovieFullInfoDto(
                m.getMovieId(),
                m.getPrimaryTitle(),
                m.getOriginalTitle(),
                m.getIsAdult(),
                m.getStartYear(),
                m.getRuntimeMinutes(),
                m.getGenres(),
                r != null ? r.getAverageRating() : null,
                r != null ? r.getNumVotes() : null,
                localized
        );
    }
}
