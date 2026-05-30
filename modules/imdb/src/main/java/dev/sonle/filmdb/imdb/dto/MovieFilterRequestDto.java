package dev.sonle.filmdb.imdb.dto;

public record MovieFilterRequestDto(
    Integer startYear,
    Float averageRating,
    Integer numVotes,
    String titleType,
    String genre
) {}
