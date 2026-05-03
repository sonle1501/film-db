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
@Getter
@Immutable
@Table(name = "movie", schema = "imdb")
@NoArgsConstructor
@AllArgsConstructor
public class Movie {
    @Id
    @Column(name = "movie_id")
    private String movieId;

    @Column(name = "title_type")
    private String titleType;

    @Column(name = "primary_title")
    private String primaryTitle;

    @Column(name = "original_title")
    private String originalTitle;

    @Column(name = "is_adult")
    private Boolean isAdult;

    @Column(name = "start_year")
    private Integer startYear;

    @Column(name = "end_year")
    private Integer endYear;

    @Column(name = "runtime_minutes")
    private Integer runtimeMinutes;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "genres", columnDefinition = "text[]") // map array text in postgre
    private List<String> genres;

    @OneToOne
    @PrimaryKeyJoinColumn
    private MovieRating rating;

    @OneToOne
    @PrimaryKeyJoinColumn
    private MovieCrew movieCrew;

    @OneToMany(mappedBy = "movie")
    private List<MovieAlternative> movieAlternatives;

    @OneToMany(mappedBy = "movie")
    private List<MoviePrincipal> moviePrincipals;

}