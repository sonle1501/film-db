package dev.sonle.filmdb.imdb.controller;

import dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto;
import dev.sonle.filmdb.imdb.dto.PersonDetailsDto;
import dev.sonle.filmdb.imdb.dto.PersonInfoDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import dev.sonle.filmdb.imdb.service.PersonQueryService;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/imdb/person")
@RequiredArgsConstructor
public class PersonController {

    private final PersonQueryService personQueryService;

    @GetMapping("/{person-id}")
    public ResponseEntity<PersonInfoDto> getPersonBasicInfo(@PathVariable("person-id") String personId){
        PersonInfoDto person = personQueryService.getPersonBasicInfo(personId);
        return ResponseEntity.ok(person);
    }
    @GetMapping("/{person-id}/details")
    public ResponseEntity<dev.sonle.filmdb.imdb.dto.PersonDetailsDto> getPersonDetails(@PathVariable("person-id") String personId){
        PersonDetailsDto personDetailsDto = personQueryService.getPersonDetails(personId);
        return ResponseEntity.ok(personDetailsDto);
    }

    @GetMapping("/{person-id}/career")
    public ResponseEntity<java.util.List<dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto>> getPersonCareer(@PathVariable("person-id") String personId){
        List<MovieBasicInfoDto> career = personQueryService.getPersonCareer(personId);
        return ResponseEntity.ok(career);
    }
}
