package dev.sonle.filmdb.shared.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@Service
public class TmdbImageService {

    @Value("${app.tmdb.bearer-token:}")
    private String tmdbBearerToken;

    @Value("${app.tmdb.image-base-url:https://image.tmdb.org/t/p/w500}")
    private String imageBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Cacheable(value = "tmdbImages", key = "#p0")
    public String resolveImageUrl(String filmId) {
        if (filmId == null || filmId.isBlank()) {
            return null;
        }

        if (tmdbBearerToken == null || tmdbBearerToken.isBlank() || tmdbBearerToken.equals("${TMDB_BEARER_TOKEN}")) {
            log.warn("TMDB Bearer Token is not configured. Returning null.");
            return null;
        }

        try {
            String url = "https://api.themoviedb.org/3/find/" + filmId + "?external_source=imdb_id";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(tmdbBearerToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<TmdbFindResult> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    TmdbFindResult.class
            );

            TmdbFindResult result = response.getBody();
            if (result != null) {
                if (result.movieResults() != null && !result.movieResults().isEmpty()) {
                    String posterPath = result.movieResults().get(0).posterPath();
                    if (posterPath != null && !posterPath.isBlank()) {
                        return imageBaseUrl + posterPath;
                    }
                }
                if (result.tvResults() != null && !result.tvResults().isEmpty()) {
                    String posterPath = result.tvResults().get(0).posterPath();
                    if (posterPath != null && !posterPath.isBlank()) {
                        return imageBaseUrl + posterPath;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch image from TMDB for film-id {}: {}", filmId, e.getMessage());
        }

        return null;
    }

    // Helper records for mapping TMDB Find API response JSON
    public record TmdbFindResult(
            @JsonProperty("movie_results") List<TmdbMovieResult> movieResults,
            @JsonProperty("tv_results") List<TmdbTvResult> tvResults
    ) {}

    public record TmdbMovieResult(
            @JsonProperty("poster_path") String posterPath
    ) {}

    public record TmdbTvResult(
            @JsonProperty("poster_path") String posterPath
    ) {}
}
