package dev.sonle.filmdb.imdb.dto;

public record PersonBasicInfoDto(
        String personId,
        String primaryName,
        Integer birthYear,
        Integer deathYear
) {
}
