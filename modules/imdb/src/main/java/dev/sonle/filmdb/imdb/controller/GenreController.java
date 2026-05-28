package dev.sonle.filmdb.imdb.controller;

import dev.sonle.filmdb.imdb.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.sonle.filmdb.shared.annotation.VersionedApi;
import java.util.List;

@RestController
@RequestMapping("/imdb/genres")
@VersionedApi
@RequiredArgsConstructor
public class GenreController {

    private final GenreService genreService;

    @GetMapping
    public ResponseEntity<List<String>> getAllGenres() {
        return ResponseEntity.ok(genreService.getAllGenres());
    }
}
