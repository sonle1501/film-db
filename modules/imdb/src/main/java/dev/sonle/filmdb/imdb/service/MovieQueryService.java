package dev.sonle.filmdb.imdb.service;

import dev.sonle.filmdb.imdb.dto.*;
import dev.sonle.filmdb.imdb.model.Movie;
import dev.sonle.filmdb.imdb.model.MovieAlternative;
import dev.sonle.filmdb.imdb.model.MovieCrew;
import dev.sonle.filmdb.imdb.model.MovieRating;
import dev.sonle.filmdb.imdb.repository.*;
import dev.sonle.filmdb.shared.exception.AppException;
import dev.sonle.filmdb.shared.exception.AppExceptionCode;
import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MovieQueryService {
    private final MovieRepository movieRepository;
    private final MovieAlternativeRepository movieAlternativeRepository;
    private final MoviePrincipalRepository moviePrincipalRepository;
    private final MovieCrewRepository movieCrewRepository;
    private final PersonRepository personRepository;
    private final MovieRatingRepository movieRatingRepository;

    public MovieBasicInfoDto getMovieBasicInfo(String movieId){
        return movieRepository.findById(movieId)
                .map(MovieBasicInfoDto::from)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.MOVIE_NOT_FOUND, String.format("Cannot found movie with id %s", movieId)));
    }

    public MovieRatingInfoDto getMovieRatingInfo(String movieId){
        return movieRepository.getMovieRatingInfoDto(movieId)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.MOVIE_NOT_FOUND, String.format("Cannot found movie with id %s", movieId)));
    }

    public MovieSupplementInfoDto getMovieSupplementInfoDto(String movieId){
        List<MovieAlternative> alternatives = movieAlternativeRepository.findAlternativesByMovieId(movieId);
        return MovieSupplementInfoDto.from(movieId, alternatives);
    }

    public MovieFullInfoDto getMovieFullInfo(String movieId){
        MovieRatingInfoDto movieRatingInfoDto = getMovieRatingInfo(movieId);
        List<MoviePersonInfoDto> moviePersonInfoDtos = getMoviePeople(movieId);
        return MovieFullInfoDto.from(movieRatingInfoDto, moviePersonInfoDtos);
    }

    public List<MoviePersonInfoDto> getMoviePeople(String movieId) {
        return moviePrincipalRepository.findPeopleByMovieId(movieId);
    }

    public MovieCrewInfoDto getMovieCrewInfo(String movieId) {
        MovieCrew crew = movieCrewRepository.findById(movieId)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.MOVIE_INFO_NOT_FOUND, String.format("Cannot found movie with id %s", movieId)));

        List<PersonBasicInfoDto> directors = Collections.emptyList();
        if (crew.getDirectors() != null && !crew.getDirectors().isEmpty()) {
            directors = personRepository.findBasicInfoByIds(crew.getDirectors());
        }
        
        List<PersonBasicInfoDto> writers = Collections.emptyList();
        if (crew.getWriters() != null && !crew.getWriters().isEmpty()) {
            writers = personRepository.findBasicInfoByIds(crew.getWriters());
        }
        return new MovieCrewInfoDto(movieId, directors, writers);
    }
}
