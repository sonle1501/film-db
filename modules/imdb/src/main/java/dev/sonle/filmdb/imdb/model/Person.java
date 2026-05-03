package dev.sonle.filmdb.imdb.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Immutable
@Table(name = "person", schema = "imdb")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Person {
    @Id
    @Column(name = "person_id")
    private String personId;

    @Column(name = "primary_name", nullable = false)
    private String primaryName;

    @Column(name = "birth_year")
    private Integer birthYear;

    @Column(name = "death_year")
    private Integer deathYear;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "primary_profession", columnDefinition = "text[]")
    private List<String> primaryProfession;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "known_for_titles", columnDefinition = "text[]")
    private List<String> knownForTitles;

    @OneToMany(mappedBy = "person")
    private List<MoviePrincipal> moviePrincipals;
}