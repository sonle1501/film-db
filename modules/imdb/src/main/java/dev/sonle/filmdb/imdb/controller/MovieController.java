package dev.sonle.filmdb.imdb.controller;

import dev.sonle.filmdb.imdb.dto.*;
import dev.sonle.filmdb.imdb.service.MovieQueryService;
import dev.sonle.filmdb.shared.utils.TmdbImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/imdb/film")
@RequiredArgsConstructor
public class MovieController {

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
    public ResponseEntity<Void> getMovieImage(@PathVariable("film-id") String filmId) {
        String imageUrl = tmdbImageService.resolveImageUrl(filmId);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(imageUrl))
                .build();
    }

}
