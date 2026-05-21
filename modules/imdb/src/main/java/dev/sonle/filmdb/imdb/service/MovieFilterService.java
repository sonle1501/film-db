package dev.sonle.filmdb.imdb.service;

import dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto;
import dev.sonle.filmdb.imdb.dto.MovieRatingInfoDto;
import dev.sonle.filmdb.imdb.dto.MovieSupplementInfoDto;
import dev.sonle.filmdb.imdb.dto.MovieFilterRequestDto;
import dev.sonle.filmdb.imdb.dto.MovieFilterSortRequestDto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import dev.sonle.filmdb.imdb.model.Movie;
import dev.sonle.filmdb.imdb.repository.MovieRepository;
import dev.sonle.filmdb.imdb.repository.MovieAlternativeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import dev.sonle.filmdb.imdb.model.MovieAlternative;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MovieFilterService {
    private final MovieRepository movieRepository;
    private final MovieAlternativeRepository movieAlternativeRepository;

    public List<MovieBasicInfoDto> getListMovieFilterByName(String name) {
        return movieRepository.findByName(name);
    }

    public Page<MovieBasicInfoDto> getListMovieFilterByName(String name, int page, int size) {
        int maxSize = 10;
        int actualSize = Math.min(size, maxSize);
        return movieRepository.findByName(name, PageRequest.of(page, actualSize));
    }

    public List<MovieBasicInfoDto> getListMovieFilterByNameAndType(String name, String type) {
        return movieRepository.findByNameAndType(name, type);
    }

    public List<MovieBasicInfoDto> getListMovieFilterByNameAndGenre(String name, String genre) {
        return movieRepository.findByNameAndGenre(name, genre).stream()
                .map(MovieBasicInfoDto::from)
                .toList();
    }

    public List<MovieSupplementInfoDto> getListMovieUseLocalizedName(String name) {
        List<MovieBasicInfoDto> movies = movieRepository.findByLocalizedName(name);
        List<String> movieIds = movies.stream().map(MovieBasicInfoDto::movieId).toList();

        Map<String, List<MovieAlternative>> alternativesMap = movieIds.isEmpty()
                ? Collections.emptyMap()
                : movieAlternativeRepository.findAlternativesByMovieIdIn(movieIds).stream()
                        .collect(Collectors.groupingBy(MovieAlternative::getMovieId));

        return movies.stream()
                .map(m -> {
                    List<MovieAlternative> alternatives = alternativesMap.getOrDefault(m.movieId(), List.of());
                    return MovieSupplementInfoDto.from(m.movieId(), alternatives);
                })
                .toList();
    }

    public List<MovieRatingInfoDto> getListMovieFilterByRating(double rating) {
        return movieRepository.getListMovieRatingInfoDto(rating);
    }

    public List<MovieBasicInfoDto> getListMovieRecent(int year) {
        return movieRepository.findRecentMovies(year);
    }

    public List<MovieRatingInfoDto> getTopRatedMovies() {
        return movieRepository.findTopRatedByTypeAndMinVotes("movie", 100000, PageRequest.of(0, 250));
    }

    public List<MovieRatingInfoDto> getTopRatedTvSeries() {
        return movieRepository.findTopRatedByTypeAndMinVotes("tvSeries", 50000, PageRequest.of(0, 100));
    }

    public List<MovieRatingInfoDto> getMostPopularMovies() {
        return movieRepository.findMostPopularByType("movie", PageRequest.of(0, 250));
    }

    public Page<MovieRatingInfoDto> filterMovies(MovieFilterRequestDto filterRequest, int page, int size) {
        int maxSize = 10;
        int actualSize = Math.min(size, maxSize);
        return movieRepository.filterMovies(
                filterRequest.startYear(),
                filterRequest.averageRating(),
                filterRequest.numVotes(),
                filterRequest.titleType(),
                PageRequest.of(page, actualSize)
        );
    }

    public Page<MovieRatingInfoDto> filterMoviesExactYear(MovieFilterRequestDto filterRequest, int page, int size) {
        int maxSize = 10;
        int actualSize = Math.min(size, maxSize);
        return movieRepository.filterMoviesExactYear(
                filterRequest.startYear(),
                filterRequest.averageRating(),
                filterRequest.numVotes(),
                filterRequest.titleType(),
                PageRequest.of(page, actualSize)
        );
    }

    public Page<MovieRatingInfoDto> filterAndSortMovies(MovieFilterSortRequestDto request, int page, int size) {
        int maxSize = 10;
        int actualSize = Math.min(size, maxSize);
        Pageable pageable = createSortedPageable(page, actualSize, request.sortBy(), request.sortDirection());
        
        return movieRepository.filterMovies(
                request.startYear(),
                request.averageRating(),
                request.numVotes(),
                request.titleType(),
                pageable
        );
    }

    public Page<MovieRatingInfoDto> filterAndSortMoviesExactYear(MovieFilterSortRequestDto request, int page, int size) {
        int maxSize = 10;
        int actualSize = Math.min(size, maxSize);
        Pageable pageable = createSortedPageable(page, actualSize, request.sortBy(), request.sortDirection());

        return movieRepository.filterMoviesExactYear(
                request.startYear(),
                request.averageRating(),
                request.numVotes(),
                request.titleType(),
                pageable
        );
    }

    private Pageable createSortedPageable(int page, int size, String sortBy, String direction) {
        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
            String field = switch (sortBy) {
                case "averageRating" -> "r.averageRating";
                case "numVotes" -> "r.numVotes";
                case "startYear" -> "m.startYear";
                default -> null;
            };
            if (field != null) {
                sort = Sort.by(dir, field);
            }
        }
        return PageRequest.of(page, size, sort);
    }
}
