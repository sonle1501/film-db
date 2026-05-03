package dev.sonle.filmdb.imdb.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "movie_principal", schema = "imdb")
@IdClass(MoviePrincipalId.class)
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MoviePrincipal {

    @Id
    @Column(name = "movie_id")
    private String movieId;

    @Id
    @Column(name = "ordering")
    private Integer ordering;

    @Column(name = "person_id")
    private String personId;

    @Column(name = "category")
    private String category;

    @Column(name = "job")
    private String job;

    @Column(name = "characters")
    private String characters;

    @ManyToOne
    @JoinColumn(name = "movie_id", insertable = false, updatable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Movie movie;

    @ManyToOne
    @JoinColumn(name = "person_id", insertable = false, updatable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Person person;
}
