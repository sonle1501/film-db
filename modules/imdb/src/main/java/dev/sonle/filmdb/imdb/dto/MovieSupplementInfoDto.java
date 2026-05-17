package dev.sonle.filmdb.imdb.dto;

import dev.sonle.filmdb.imdb.model.Movie;
import dev.sonle.filmdb.imdb.model.MovieAlternative;
import java.util.List;

public record MovieSupplementInfoDto(
        String movieId,
        List<LocalizedTitle> localizedTitles
) {
    public record LocalizedTitle(String title, String region, String language) {}

    public static MovieSupplementInfoDto from(String movieId, List<MovieAlternative> alternatives) {
        List<LocalizedTitle> localized = alternatives != null ? alternatives.stream()
                .map(alt -> new LocalizedTitle(alt.getTitle(), alt.getRegion(),  alt.getLanguage()))
                .toList() : List.of();
                
        return new MovieSupplementInfoDto(movieId, localized);
    }
}
