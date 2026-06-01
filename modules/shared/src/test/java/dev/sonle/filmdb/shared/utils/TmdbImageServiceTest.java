package dev.sonle.filmdb.shared.utils;

import dev.sonle.filmdb.shared.config.TmdbProperties;
import dev.sonle.filmdb.shared.utils.TmdbImageService.TmdbFindResult;
import dev.sonle.filmdb.shared.utils.TmdbImageService.TmdbMovieResult;
import dev.sonle.filmdb.shared.utils.TmdbImageService.TmdbTvResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TmdbImageServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private TmdbProperties tmdbProperties;
    private TmdbImageService tmdbImageService;

    private static final String IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
    private static final String BEARER_TOKEN = "mock-bearer-token";

    @BeforeEach
    void setUp() {
        tmdbProperties = new TmdbProperties(BEARER_TOKEN, IMAGE_BASE_URL);
        tmdbImageService = new TmdbImageService(tmdbProperties);
        ReflectionTestUtils.setField(tmdbImageService, "restTemplate", restTemplate);
    }

    @Test
    void shouldReturnNullForBlankOrNullFilmId() {
        assertNull(tmdbImageService.resolveImageUrl(null));
        assertNull(tmdbImageService.resolveImageUrl(""));
        assertNull(tmdbImageService.resolveImageUrl("   "));
        verifyNoInteractions(restTemplate);
    }

    @Test
    void shouldReturnNullWhenBearerTokenIsMissingOrPlaceholder() {
        // Test null token
        tmdbImageService = new TmdbImageService(new TmdbProperties(null, IMAGE_BASE_URL));
        assertNull(tmdbImageService.resolveImageUrl("tt1234567"));

        // Test empty token
        tmdbImageService = new TmdbImageService(new TmdbProperties("", IMAGE_BASE_URL));
        assertNull(tmdbImageService.resolveImageUrl("tt1234567"));

        // Test placeholder token
        tmdbImageService = new TmdbImageService(new TmdbProperties("${TMDB_BEARER_TOKEN}", IMAGE_BASE_URL));
        assertNull(tmdbImageService.resolveImageUrl("tt1234567"));

        verifyNoInteractions(restTemplate);
    }

    @Test
    void shouldResolveMovieImageUrlSuccessfully() {
        String filmId = "tt1234567";
        String posterPath = "/movie-poster.jpg";
        
        TmdbMovieResult movieResult = new TmdbMovieResult(posterPath);
        TmdbFindResult findResult = new TmdbFindResult(List.of(movieResult), Collections.emptyList());
        ResponseEntity<TmdbFindResult> responseEntity = new ResponseEntity<>(findResult, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("https://api.themoviedb.org/3/find/" + filmId + "?external_source=imdb_id"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(TmdbFindResult.class)
        )).thenReturn(responseEntity);

        String result = tmdbImageService.resolveImageUrl(filmId);

        assertEquals(IMAGE_BASE_URL + posterPath, result);
    }

    @Test
    void shouldResolveTvImageUrlSuccessfullyWhenMovieResultsEmpty() {
        String filmId = "tt7654321";
        String posterPath = "/tv-poster.jpg";
        
        TmdbTvResult tvResult = new TmdbTvResult(posterPath);
        TmdbFindResult findResult = new TmdbFindResult(Collections.emptyList(), List.of(tvResult));
        ResponseEntity<TmdbFindResult> responseEntity = new ResponseEntity<>(findResult, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("https://api.themoviedb.org/3/find/" + filmId + "?external_source=imdb_id"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(TmdbFindResult.class)
        )).thenReturn(responseEntity);

        String result = tmdbImageService.resolveImageUrl(filmId);

        assertEquals(IMAGE_BASE_URL + posterPath, result);
    }

    @Test
    void shouldReturnNullWhenResponseIsEmptyOrNoPosters() {
        String filmId = "tt1122334";
        
        TmdbFindResult findResult = new TmdbFindResult(Collections.emptyList(), Collections.emptyList());
        ResponseEntity<TmdbFindResult> responseEntity = new ResponseEntity<>(findResult, HttpStatus.OK);

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(TmdbFindResult.class)
        )).thenReturn(responseEntity);

        assertNull(tmdbImageService.resolveImageUrl(filmId));
    }

    @Test
    void shouldReturnNullAndLogExceptionWhenApiThrowsError() {
        String filmId = "tt1122334";

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(TmdbFindResult.class)
        )).thenThrow(new RuntimeException("API Connection timeout"));

        assertNull(tmdbImageService.resolveImageUrl(filmId));
    }
}
