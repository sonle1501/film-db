package dev.sonle.filmdb.imdb.service;

import dev.sonle.filmdb.imdb.dto.*;
import dev.sonle.filmdb.imdb.model.Movie;
import dev.sonle.filmdb.imdb.model.MovieAlternative;
import dev.sonle.filmdb.imdb.repository.MovieAlternativeRepository;
import dev.sonle.filmdb.imdb.repository.MovieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MovieFilterServiceTest {

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private MovieAlternativeRepository movieAlternativeRepository;

    private MovieFilterService movieFilterService;

    private MovieBasicInfoDto movieDto;
    private MovieRatingInfoDto ratingDto;

    @BeforeEach
    void setUp() {
        movieFilterService = new MovieFilterService(movieRepository, movieAlternativeRepository);

        movieDto = new MovieBasicInfoDto(
                "tt0000001",
                "Carmencita",
                "Carmencita",
                false,
                1894,
                1,
                List.of("Documentary", "Short")
        );

        ratingDto = new MovieRatingInfoDto(
                "tt0000001",
                "Carmencita",
                "Carmencita",
                false,
                1894,
                1,
                List.of("Documentary", "Short"),
                8.2f,
                150
        );
    }

    @Test
    void shouldGetListMovieFilterByName() {
        when(movieRepository.findByName("Carmencita")).thenReturn(List.of(movieDto));

        List<MovieBasicInfoDto> result = movieFilterService.getListMovieFilterByName("Carmencita");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("tt0000001", result.get(0).movieId());
    }

    @Test
    void shouldGetListMovieFilterByNamePaginated() {
        Page<MovieBasicInfoDto> page = new PageImpl<>(List.of(movieDto));
        when(movieRepository.findByName(eq("Carmencita"), any(Pageable.class))).thenReturn(page);

        Page<MovieBasicInfoDto> result = movieFilterService.getListMovieFilterByName("Carmencita", 0, 5);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldGetListMovieFilterByNameAndType() {
        when(movieRepository.findByNameAndType("Carmencita", "short")).thenReturn(List.of(movieDto));

        List<MovieBasicInfoDto> result = movieFilterService.getListMovieFilterByNameAndType("Carmencita", "short");

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void shouldGetListMovieFilterByNameAndGenre() {
        Movie mockMovie = new Movie(
                "tt0000001",
                null,
                "Carmencita",
                "Carmencita",
                false,
                1894,
                null,
                1,
                List.of("Documentary"),
                null,
                null,
                null,
                null
        );

        when(movieRepository.findByNameAndGenre("Carmencita", "Documentary")).thenReturn(List.of(mockMovie));

        List<MovieBasicInfoDto> result = movieFilterService.getListMovieFilterByNameAndGenre("Carmencita", "Documentary");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("tt0000001", result.get(0).movieId());
    }

    @Test
    void shouldGetListMovieUseLocalizedName() {
        when(movieRepository.findByLocalizedName("Carmencita")).thenReturn(List.of(movieDto));
        
        MovieAlternative alt = new MovieAlternative(
                "tt0000001",
                1,
                "Carmencita Spanish",
                "ES",
                "es",
                List.of("alternative"),
                List.of("dvd"),
                false,
                null
        );
        when(movieAlternativeRepository.findAlternativesByMovieIdIn(List.of("tt0000001"))).thenReturn(List.of(alt));

        List<MovieSupplementInfoDto> result = movieFilterService.getListMovieUseLocalizedName("Carmencita");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("tt0000001", result.get(0).movieId());
        assertEquals(1, result.get(0).localizedTitles().size());
        assertEquals("Carmencita Spanish", result.get(0).localizedTitles().get(0).title());
    }

    @Test
    void shouldGetListMovieFilterByRating() {
        when(movieRepository.getListMovieRatingInfoDto(8.0)).thenReturn(List.of(ratingDto));

        List<MovieRatingInfoDto> result = movieFilterService.getListMovieFilterByRating(8.0);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(8.2f, result.get(0).averageRating());
    }

    @Test
    void shouldGetListMovieRecent() {
        when(movieRepository.findRecentMovies(2025)).thenReturn(List.of(movieDto));

        List<MovieBasicInfoDto> result = movieFilterService.getListMovieRecent(2025);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void shouldGetTopRatedMovies() {
        when(movieRepository.findTopRatedByTypeAndMinVotes(eq("movie"), eq(100000), any(Pageable.class)))
                .thenReturn(List.of(ratingDto));

        List<MovieRatingInfoDto> result = movieFilterService.getTopRatedMovies();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void shouldGetTopRatedTvSeries() {
        when(movieRepository.findTopRatedByTypeAndMinVotes(eq("tvSeries"), eq(50000), any(Pageable.class)))
                .thenReturn(List.of(ratingDto));

        List<MovieRatingInfoDto> result = movieFilterService.getTopRatedTvSeries();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void shouldGetMostPopularMovies() {
        when(movieRepository.findMostPopularByType(eq("movie"), any(Pageable.class)))
                .thenReturn(List.of(ratingDto));

        List<MovieRatingInfoDto> result = movieFilterService.getMostPopularMovies();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void shouldFilterMovies() {
        MovieFilterRequestDto filterDto = new MovieFilterRequestDto(2020, 7.5f, 1000, "movie", "Drama");
        Page<MovieRatingInfoDto> page = new PageImpl<>(List.of(ratingDto));
        when(movieRepository.filterMovies(any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        Page<MovieRatingInfoDto> result = movieFilterService.filterMovies(filterDto, 0, 5);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldFilterMoviesExactYear() {
        MovieFilterRequestDto filterDto = new MovieFilterRequestDto(2020, 7.5f, 1000, "movie", "Drama");
        Page<MovieRatingInfoDto> page = new PageImpl<>(List.of(ratingDto));
        when(movieRepository.filterMoviesExactYear(any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        Page<MovieRatingInfoDto> result = movieFilterService.filterMoviesExactYear(filterDto, 0, 5);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldFilterAndSortMovies() {
        MovieFilterSortRequestDto request = new MovieFilterSortRequestDto(2020, 7.5f, 1000, "movie", "Drama", "averageRating", "desc");
        Page<MovieRatingInfoDto> page = new PageImpl<>(List.of(ratingDto));
        when(movieRepository.filterMovies(any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        Page<MovieRatingInfoDto> result = movieFilterService.filterAndSortMovies(request, 0, 5);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldFilterAndSortMoviesExactYear() {
        MovieFilterSortRequestDto request = new MovieFilterSortRequestDto(2020, 7.5f, 1000, "movie", "Drama", "startYear", "asc");
        Page<MovieRatingInfoDto> page = new PageImpl<>(List.of(ratingDto));
        when(movieRepository.filterMoviesExactYear(any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        Page<MovieRatingInfoDto> result = movieFilterService.filterAndSortMoviesExactYear(request, 0, 5);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldGetListMovieByGenre() {
        Movie mockMovie = new Movie(
                "tt0000001",
                null,
                "Carmencita",
                "Carmencita",
                false,
                1894,
                null,
                1,
                List.of("Documentary"),
                null,
                null,
                null,
                null
        );

        Page<Movie> page = new PageImpl<>(List.of(mockMovie));
        when(movieRepository.findByGenre(eq("Documentary"), any(Pageable.class))).thenReturn(page);

        Page<MovieBasicInfoDto> result = movieFilterService.getListMovieByGenre("Documentary", 0, 5);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("tt0000001", result.getContent().get(0).movieId());
    }
}
