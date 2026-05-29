package dev.sonle.filmdb.imdb.dto;

import dev.sonle.filmdb.imdb.model.Movie;

import dev.sonle.filmdb.shared.interfaces.MovieImageEnabled;

import java.util.List;

public record MovieBasicInfoDto(String movieId,
                                String primaryTitle,
                                String originalTitle,
                                Boolean isAdult,
                                Integer startYear,
                                Integer runtimeMinutes,
                                List<String> genres
) implements MovieImageEnabled {
    public static MovieBasicInfoDto from(Movie m){
        return new MovieBasicInfoDto(m.getMovieId(), m.getPrimaryTitle(), m.getOriginalTitle(), m.getIsAdult(), m.getStartYear(), m.getRuntimeMinutes(), m.getGenres());
    }
}
