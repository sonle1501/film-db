package dev.sonle.filmdb.imdb.dto;

import java.math.BigDecimal;

public record MovieFilterRequestDto(
    Integer startYear,
    BigDecimal averageRating,
    Integer numVotes,
    String titleType
) {}
