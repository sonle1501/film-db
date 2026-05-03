package dev.sonle.filmdb.imdb.dto;

import dev.sonle.filmdb.imdb.model.Movie;
import dev.sonle.filmdb.imdb.model.MovieAlternative;
import java.util.List;

public record MovieSupplementInfoDto(
        String movieId,
        String primaryTitle,
        String originalTitle,
        Boolean isAdult,
        Integer startYear,
        Integer runtimeMinutes,
        List<String> genres,
        List<LocalizedTitle> localizedTitles
) {
    public record LocalizedTitle(String title, String language) {}

    public static MovieSupplementInfoDto from(Movie m, List<MovieAlternative> alternatives) {
        List<LocalizedTitle> localized = alternatives != null ? alternatives.stream()
                .map(a -> new LocalizedTitle(a.getTitle(), a.getLanguage()))
                .toList() : List.of();
                
        return new MovieSupplementInfoDto(
                m.getMovieId(), m.getPrimaryTitle(), m.getOriginalTitle(), m.getIsAdult(),
                m.getStartYear(), m.getRuntimeMinutes(), m.getGenres(), localized
        );
    }

    public static MovieSupplementInfoDto from(MovieBasicInfoDto m, List<MovieAlternative> alternatives) {
        List<LocalizedTitle> localized = alternatives != null ? alternatives.stream()
                .map(a -> new LocalizedTitle(a.getTitle(), a.getLanguage()))
                .toList() : List.of();
                
        return new MovieSupplementInfoDto(
                m.movieId(), m.primaryTitle(), m.originalTitle(), m.isAdult(),
                m.startYear(), m.runtimeMinutes(), m.genres(), localized
        );
    }
}
