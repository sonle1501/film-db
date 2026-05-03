package dev.sonle.filmdb.imdb.service;

import dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto;
import dev.sonle.filmdb.imdb.dto.MovieRatingInfoDto;
import dev.sonle.filmdb.imdb.dto.MovieSupplementInfoDto;
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
                    return MovieSupplementInfoDto.from(m, alternatives);
                })
                .toList();
    }

    public List<MovieRatingInfoDto> getListMovieFilterByRating(double rating) {
        return movieRepository.getListMovieRatingInfoDto(rating);
    }

    public List<MovieBasicInfoDto> getListMovieRecent(int year) {
        return movieRepository.findRecentMovies(year);
    }
}
