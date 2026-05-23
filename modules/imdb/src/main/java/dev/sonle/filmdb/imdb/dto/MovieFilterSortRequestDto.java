package dev.sonle.filmdb.imdb.dto;

import java.math.BigDecimal;

public record MovieFilterSortRequestDto(
    Integer startYear,
    BigDecimal averageRating,
    Integer numVotes,
    String titleType,
    String sortBy,
    String sortDirection,
    String genre
) {}
