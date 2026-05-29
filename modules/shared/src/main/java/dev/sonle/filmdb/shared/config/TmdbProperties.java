package dev.sonle.filmdb.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.tmdb")
public record TmdbProperties(
    String bearerToken,
    @DefaultValue("https://image.tmdb.org/t/p/w500") String imageBaseUrl
) {}
