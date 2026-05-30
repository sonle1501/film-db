package dev.sonle.filmdb.search.dto;

import dev.sonle.filmdb.shared.interfaces.MovieImageEnabled;
import java.util.List;

public record MovieSearchResultDto(
    String movieId,
    String primaryTitle,
    String originalTitle,
    String titleType,
    Integer startYear,
    List<String> genres,
    Float averageRating,
    Integer numVotes,
    Double relevanceScore
) implements MovieImageEnabled {}
