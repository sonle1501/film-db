package dev.sonle.filmdb.imdb.dto;

import dev.sonle.filmdb.imdb.model.Person;
import java.util.List;

public record PersonInfoDto(
        String personId,
        String primaryName,
        Integer birthYear,
        Integer deathYear,
        List<String> primaryProfession,
        List<String> knownForTitles
) {
    public static PersonInfoDto from(Person p) {
        return new PersonInfoDto(
                p.getPersonId(), p.getPrimaryName(), p.getBirthYear(),
                p.getDeathYear(), p.getPrimaryProfession(), p.getKnownForTitles()
        );
    }
}
