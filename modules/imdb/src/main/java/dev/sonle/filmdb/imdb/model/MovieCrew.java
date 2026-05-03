package dev.sonle.filmdb.imdb.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
@Table(name = "movie_crew", schema = "imdb")
@NoArgsConstructor
@AllArgsConstructor
public class MovieCrew {
    @Id
    @Column(name = "movie_id")
    private String movieId;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "directors", columnDefinition = "text[]")
    private List<String> directors;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "writers", columnDefinition = "text[]")
    private List<String> writers;
}
