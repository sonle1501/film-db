package dev.sonle.filmdb.shared.utils;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.sonle.filmdb.shared.config.TmdbProperties;
import lombok.extern.slf4j.Slf4j;
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

    private final TmdbProperties tmdbProperties;
    private final RestTemplate restTemplate = new RestTemplate();

    public TmdbImageService(TmdbProperties tmdbProperties) {
        this.tmdbProperties = tmdbProperties;
    }

    @Cacheable(value = "tmdbImages", key = "#p0")
    public String resolveImageUrl(String filmId) {
        if (filmId == null || filmId.isBlank()) {
            return null;
        }

        String bearerToken = tmdbProperties.bearerToken();
        if (bearerToken == null || bearerToken.isBlank() || bearerToken.equals("${TMDB_BEARER_TOKEN}")) {
            log.warn("TMDB Bearer Token is not configured. Returning null.");
            return null;
        }

        try {
            String url = "https://api.themoviedb.org/3/find/" + filmId + "?external_source=imdb_id";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(bearerToken);
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
                        return tmdbProperties.imageBaseUrl() + posterPath;
                    }
                }
                if (result.tvResults() != null && !result.tvResults().isEmpty()) {
                    String posterPath = result.tvResults().get(0).posterPath();
                    if (posterPath != null && !posterPath.isBlank()) {
                        return tmdbProperties.imageBaseUrl() + posterPath;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch image from TMDB for film-id {}: {}", filmId, e.getMessage());
        }

        return null;
    }

    public byte[] fetchImageBytes(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        try {
            return restTemplate.getForObject(url, byte[].class);
        } catch (Exception e) {
            log.error("Failed to fetch image bytes from TMDB URL {}: {}", url, e.getMessage());
            return null;
        }
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
