package dev.sonle.filmdb.imdb.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

@Entity
@Getter
@Immutable
@Table(name = "movie_episode", schema = "imdb")
@NoArgsConstructor
@AllArgsConstructor
public class MovieEpisode {

    @Id
    @Column(name = "movie_id")
    private String movieId;

    @Column(name = "parent_movie_id")
    private String parentMovieId;

    @Column(name = "season_number")
    private Integer seasonNumber;

    @Column(name = "episode_number")
    private Integer episodeNumber;

    @OneToOne
    @PrimaryKeyJoinColumn
    private Movie episode;

    @ManyToOne
    @JoinColumn(name = "parent_movie_id", insertable = false, updatable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Movie parentMovie;
}
