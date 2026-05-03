package dev.sonle.filmdb.imdb.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.io.Serializable;

@Data
@Immutable
@NoArgsConstructor
@AllArgsConstructor
public class MovieAlternativeId implements Serializable {
    private String movieId;
    private Integer ordering;
}
