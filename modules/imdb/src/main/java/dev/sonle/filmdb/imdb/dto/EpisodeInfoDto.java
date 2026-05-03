package dev.sonle.filmdb.imdb.dto;

public record EpisodeInfoDto(
        String episodeId,
        String parentMovieId,
        Integer seasonNumber,
        Integer episodeNumber,
        String primaryTitle,
        String originalTitle,
        Integer startYear,
        Integer runtimeMinutes
) {
}
