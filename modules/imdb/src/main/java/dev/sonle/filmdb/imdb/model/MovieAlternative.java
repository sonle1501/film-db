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
@Table(name = "movie_alternative", schema = "imdb")
@IdClass(MovieAlternativeId.class)
@NoArgsConstructor
@AllArgsConstructor
public class MovieAlternative {

    @Id
    @Column(name = "movie_id")
    private String movieId;

    @Id
    @Column(name = "ordering")
    private Integer ordering;

    @Column(name = "title")
    private String title;

    @Column(name = "region")
    private String region;

    @Column(name = "language")
    private String language;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "types", columnDefinition = "text[]")
    private List<String> types;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "attributes", columnDefinition = "text[]")
    private List<String> attributes;

    @Column(name = "is_original_title")
    private Boolean isOriginalTitle;

    @ManyToOne
    @JoinColumn(name = "movie_id", insertable = false, updatable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Movie movie;
}
