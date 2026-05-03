package dev.sonle.filmdb.imdb.dto;

import java.util.List;

public record PersonDetailsDto(
        String personId,
        String primaryName,
        List<String> primaryProfession,
        List<MovieBasicInfoDto> knownForTitles
) {
}
