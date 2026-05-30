package dev.sonle.filmdb.imdb.dto;

public record MovieFilterSortRequestDto(
    Integer startYear,
    Float averageRating,
    Integer numVotes,
    String titleType,
    String sortBy,
    String sortDirection,
    String genre
) {}
