package dev.sonle.filmdb.imdb.repository;

import dev.sonle.filmdb.imdb.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface PersonRepository extends JpaRepository<Person, String> {

    @Query("""
    SELECT new dev.sonle.filmdb.imdb.dto.PersonBasicInfoDto(
        p.personId, p.primaryName, p.birthYear, p.deathYear
    )
    FROM Person p
    WHERE p.personId IN :personIds
    """)
    List<dev.sonle.filmdb.imdb.dto.PersonBasicInfoDto> findBasicInfoByIds(@Param("personIds") List<String> personIds);
}
