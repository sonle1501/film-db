package dev.sonle.filmdb.imdb.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.io.Serializable;

@Getter
@Immutable
@NoArgsConstructor
@AllArgsConstructor
public class MoviePrincipalId implements Serializable {
    private String movieId;
    private Integer ordering;
}
