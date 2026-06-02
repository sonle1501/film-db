package dev.sonle.filmdb.imdb.service;

import dev.sonle.filmdb.imdb.repository.MovieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GenreServiceTest {

    @Mock
    private MovieRepository movieRepository;

    private GenreService genreService;

    @BeforeEach
    void setUp() {
        genreService = new GenreService(movieRepository);
    }

    @Test
    void shouldReturnAllGenresFromRepository() {
        List<String> mockGenres = List.of("Action", "Comedy", "Drama", "Sci-Fi");
        when(movieRepository.findAllGenres()).thenReturn(mockGenres);

        List<String> result = genreService.getAllGenres();

        assertEquals(mockGenres, result);
        verify(movieRepository, times(1)).findAllGenres();
    }
}
