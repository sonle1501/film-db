package dev.sonle.filmdb.shared;

import com.fasterxml.jackson.annotation.JsonProperty;

public interface MovieImageEnabled {
    String movieId();

    @JsonProperty("imageUrl")
    default String imageUrl() {
        return "/api/v1/imdb/film/" + movieId() + "/image";
    }
}
