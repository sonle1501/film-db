package dev.sonle.filmdb.importer.pipeline;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.nio.file.Path;
import java.nio.file.Paths;

@Getter
@RequiredArgsConstructor
public enum DatasetInfo {

    MOVIE("title.basics.tsv.gz", "imdb.movie"),
    PERSON("name.basics.tsv.gz", "imdb.person"),
    ALTERNATIVE("title.akas.tsv.gz", "imdb.movie_alternative"),
    CREW("title.crew.tsv.gz", "imdb.movie_crew"),
    EPISODE("title.episode.tsv.gz", "imdb.movie_episode"),
    PRINCIPAL("title.principals.tsv.gz", "imdb.movie_principal"),
    RATING("title.ratings.tsv.gz", "imdb.movie_rating");

    private final String fileName;
    private final String targetTable;


    public Path getFilePath(String baseDir) {
        return Paths.get(baseDir, this.fileName);
    }
}
