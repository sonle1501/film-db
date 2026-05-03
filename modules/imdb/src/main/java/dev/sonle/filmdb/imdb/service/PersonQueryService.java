package dev.sonle.filmdb.imdb.service;

import dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto;
import dev.sonle.filmdb.imdb.dto.PersonDetailsDto;
import dev.sonle.filmdb.imdb.dto.PersonInfoDto;
import dev.sonle.filmdb.imdb.model.Person;
import dev.sonle.filmdb.imdb.repository.MovieRepository;
import dev.sonle.filmdb.imdb.repository.PersonRepository;
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
public class PersonQueryService {
    
    private final PersonRepository personRepository;
    private final MovieRepository movieRepository;

    public PersonInfoDto getPersonBasicInfo(String personId) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.PERSON_NOT_FOUND,
                        String.format("Person not found with id %s", personId)));
        return PersonInfoDto.from(person);
    }

    public PersonDetailsDto getPersonDetails(String personId) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.PERSON_NOT_FOUND,
                        String.format("Person not found with id %s", personId)));

        List<MovieBasicInfoDto> movies = Collections.emptyList();
        if (person.getKnownForTitles() != null && !person.getKnownForTitles().isEmpty()) {
            List<String> movieIds = person.getKnownForTitles().stream().limit(4).toList(); // max number of movies is 4 in default
            movies = movieRepository.findBasicInfoByIds(movieIds);
        }
        return new PersonDetailsDto(person.getPersonId(), person.getPrimaryName(), person.getPrimaryProfession(), movies);
    }

    public List<MovieBasicInfoDto> getPersonCareer(String personId) {
        return movieRepository.findCareerMoviesByPersonId(personId);
    }
}
