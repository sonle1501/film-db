package dev.sonle.filmdb.imdb.service;

import dev.sonle.filmdb.imdb.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class GenreService {

    private final MovieRepository movieRepository;

    public List<String> getAllGenres() {
        return movieRepository.findAllGenres();
    }
}
