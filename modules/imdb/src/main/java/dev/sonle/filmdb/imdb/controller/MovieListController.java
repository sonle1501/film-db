package dev.sonle.filmdb.imdb.controller;

import dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto;
import dev.sonle.filmdb.imdb.dto.MovieRatingInfoDto;
import dev.sonle.filmdb.imdb.dto.MovieSupplementInfoDto;
import dev.sonle.filmdb.imdb.dto.MovieFilterRequestDto;
import dev.sonle.filmdb.imdb.dto.MovieFilterSortRequestDto;
import dev.sonle.filmdb.imdb.service.MovieFilterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;

import dev.sonle.filmdb.shared.annotation.VersionedApi;
import org.springframework.data.domain.Page;
import java.util.List;

@RestController
@RequestMapping("/imdb/listfilm")
@VersionedApi
@RequiredArgsConstructor
public class MovieListController {

    private final MovieFilterService movieFilterService;

    @GetMapping("/by-name")
    public ResponseEntity<List<MovieBasicInfoDto>> getListMovieFilterByName(@RequestParam("name") String name){
        return ResponseEntity.ok(movieFilterService.getListMovieFilterByName(name));
    }

    @GetMapping("/by-name-limit")
    public ResponseEntity<Page<MovieBasicInfoDto>> getListMovieFilterByNameWithLimit(
            @RequestParam("name") String name,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size){
        return ResponseEntity.ok(movieFilterService.getListMovieFilterByName(name, page, size));
    }

    @GetMapping("/by-name-and-type")
    public ResponseEntity<List<MovieBasicInfoDto>> getListMovieFilterByNameAndType(@RequestParam("name") String name, @RequestParam("type") String type){
        return ResponseEntity.ok(movieFilterService.getListMovieFilterByNameAndType(name, type));
    }

    @GetMapping("/by-name-and-genre")
    public ResponseEntity<List<MovieBasicInfoDto>> getListMovieFilterByNameAndGenre(@RequestParam("name") String name, @RequestParam("genre") String genre){
        return ResponseEntity.ok(movieFilterService.getListMovieFilterByNameAndGenre(name, genre));
    }

    @GetMapping("/by-genre")
    public ResponseEntity<Page<MovieBasicInfoDto>> getListMovieByGenre(
            @RequestParam("genre") String genre,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(movieFilterService.getListMovieByGenre(genre, page, size));
    }

    @GetMapping("/localized")
    public ResponseEntity<List<MovieSupplementInfoDto>> getListMovieUseLocalizedName(@RequestParam("name") String name){
        return ResponseEntity.ok(movieFilterService.getListMovieUseLocalizedName(name));
    }

    @GetMapping("/rating/{rating}")
    public ResponseEntity<List<MovieRatingInfoDto>> getListMovieFilterByRating(@PathVariable("rating") double rating){
        return ResponseEntity.ok(movieFilterService.getListMovieFilterByRating(rating));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<MovieBasicInfoDto>> getListMovieRecent(@RequestParam(name = "year") int year){
        return ResponseEntity.ok(movieFilterService.getListMovieRecent(year));
    }

    @GetMapping("/top-rated-movies")
    public ResponseEntity<List<MovieRatingInfoDto>> getTopRatedMovies(){
        return ResponseEntity.ok(movieFilterService.getTopRatedMovies());
    }

    @GetMapping("/top-rated-tvseries")
    public ResponseEntity<List<MovieRatingInfoDto>> getTopRatedTvSeries(){
        return ResponseEntity.ok(movieFilterService.getTopRatedTvSeries());
    }

    @GetMapping("/popular-movies")
    public ResponseEntity<List<MovieRatingInfoDto>> getMostPopularMovies(){
        return ResponseEntity.ok(movieFilterService.getMostPopularMovies());
    }

    @PatchMapping("/filter")
    public ResponseEntity<Page<MovieRatingInfoDto>> filterMovies(
            @RequestBody MovieFilterRequestDto filterRequest,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(movieFilterService.filterMovies(filterRequest, page, size));
    }

    @PatchMapping("/filter-year")
    public ResponseEntity<Page<MovieRatingInfoDto>> filterMoviesExactYear(
            @RequestBody MovieFilterRequestDto filterRequest,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(movieFilterService.filterMoviesExactYear(filterRequest, page, size));
    }

    @PatchMapping("/filter/sort")
    public ResponseEntity<Page<MovieRatingInfoDto>> filterAndSortMovies(
            @RequestBody MovieFilterSortRequestDto filterSortRequest,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(movieFilterService.filterAndSortMovies(filterSortRequest, page, size));
    }

    @PatchMapping("/filter-year/sort")
    public ResponseEntity<Page<MovieRatingInfoDto>> filterAndSortMoviesExactYear(
            @RequestBody MovieFilterSortRequestDto filterSortRequest,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(movieFilterService.filterAndSortMoviesExactYear(filterSortRequest, page, size));
    }
}
