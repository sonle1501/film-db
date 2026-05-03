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

@Entity
@Immutable
@Table(name = "movie_rating", schema = "imdb")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MovieRating {

    @Id
    @Column(name = "movie_id")
    private String movieId;

    @Column(name = "average_rating")
    private java.math.BigDecimal averageRating;

    @Column(name = "num_votes")
    private Integer numVotes;
}
