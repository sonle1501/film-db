package dev.sonle.filmdb.imdb.controller;

import dev.sonle.filmdb.imdb.dto.*;
import dev.sonle.filmdb.imdb.service.MovieQueryService;
import dev.sonle.filmdb.shared.utils.TmdbImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import dev.sonle.filmdb.shared.annotation.VersionedApi;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/imdb/film")
@VersionedApi
@RequiredArgsConstructor
public class MovieController {

    private static final String PLACEHOLDER_IMAGE_URL = "https://placehold.net/400x600.png";

    private final MovieQueryService movieQueryService;
    private final TmdbImageService tmdbImageService;

    @GetMapping("/{film-id}")
    public ResponseEntity<MovieBasicInfoDto> getMovieBasicInfo(@PathVariable("film-id") String filmId){
        MovieBasicInfoDto movie = movieQueryService.getMovieBasicInfo(filmId);
        return ResponseEntity.ok(movie);
    }

    @GetMapping("/full/{film-id}")
    public ResponseEntity<MovieFullInfoDto> getMovieFullInfo(@PathVariable("film-id") String filmId){
        MovieFullInfoDto movie = movieQueryService.getMovieFullInfo(filmId);
        return ResponseEntity.ok(movie);
    }

    @GetMapping("/rating/{film-id}")
    public ResponseEntity<MovieRatingInfoDto> getMovieRatingInfo(@PathVariable("film-id") String filmId){
        MovieRatingInfoDto movie = movieQueryService.getMovieRatingInfo(filmId);
        return ResponseEntity.ok(movie);
    }

    @GetMapping("/alternative/{film-id}")
    public ResponseEntity<MovieSupplementInfoDto> getMovieSupplementInfo(@PathVariable("film-id") String filmId){
        MovieSupplementInfoDto movie = movieQueryService.getMovieSupplementInfoDto(filmId);
        return ResponseEntity.ok(movie);
    }

    @GetMapping("/{film-id}/people")
    public ResponseEntity<List<MoviePersonInfoDto>> getMoviePeople(@PathVariable("film-id") String filmId){
        List<MoviePersonInfoDto> people = movieQueryService.getMoviePeople(filmId);
        return ResponseEntity.ok(people);
    }

    @GetMapping("/{film-id}/crew")
    public ResponseEntity<MovieCrewInfoDto> getMovieCrewInfo(@PathVariable("film-id") String filmId){
        MovieCrewInfoDto movieCrewInfoDto = movieQueryService.getMovieCrewInfo(filmId);
        return ResponseEntity.ok(movieCrewInfoDto);
    }

    @GetMapping("/{film-id}/image")
    public ResponseEntity<?> getMovieImage(@PathVariable("film-id") String filmId) {
        String imageUrl = tmdbImageService.resolveImageUrl(filmId);
        if (imageUrl == null || imageUrl.isBlank()) {
            imageUrl = PLACEHOLDER_IMAGE_URL;
        }

        // If it's a local/external placeholder (not from TMDB), redirect to it directly
        if (!imageUrl.contains("tmdb.org") && !imageUrl.contains("themoviedb.org")) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(imageUrl))
                    .build();
        }

        // Stream the image bytes through the proxy to bypass SNI blocking in client browsers
        byte[] imageBytes = tmdbImageService.fetchImageBytes(imageUrl);
        if (imageBytes != null) {
            MediaType contentType = MediaType.IMAGE_JPEG;
            if (imageUrl.endsWith(".png")) {
                contentType = MediaType.IMAGE_PNG;
            } else if (imageUrl.endsWith(".gif")) {
                contentType = MediaType.IMAGE_GIF;
            }

            return ResponseEntity.ok()
                    .contentType(contentType)
                    .body(imageBytes);
        }

        // Fallback to placeholder redirect if proxy download fails
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(PLACEHOLDER_IMAGE_URL))
                .build();
    }

}
