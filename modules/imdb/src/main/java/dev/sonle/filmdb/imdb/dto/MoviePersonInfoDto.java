package dev.sonle.filmdb.imdb.dto;

public record MoviePersonInfoDto(
        String personId,
        String primaryName,
        Integer birthYear,
        Integer deathYear,
        String category,
        String job,
        String characters
) {
}
