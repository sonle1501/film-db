package dev.sonle.filmdb.importer.service;

import dev.sonle.filmdb.importer.core.PostgreArrayFormatter;
import dev.sonle.filmdb.importer.core.PostgreCopyEngine;
import org.postgresql.copy.CopyManager;
import org.postgresql.core.BaseConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Service
public class ImdbImportService {
    private static final Logger log = LoggerFactory.getLogger(ImdbImportService.class);
    private final DataSource dataSource;
    private final PostgreCopyEngine postgreCopyEngine;
    private final PostgreArrayFormatter postgreArrayFormatter;
    private static final int BATCH_SIZE = 100_000;


    ImdbImportService(DataSource dataSource, PostgreCopyEngine postgreCopyEngine, PostgreArrayFormatter postgreArrayFormatter){
        this.dataSource = dataSource;
        this.postgreCopyEngine = postgreCopyEngine;
        this.postgreArrayFormatter = postgreArrayFormatter;
    }

    private void importData(String gzipFilePath, String sqlCopyCommand, PostgreArrayFormatter.ArrayFormatter formatter, String taskName){
        log.info("Starting stream import for {} from: {}", taskName, gzipFilePath);
        try (Connection conn = dataSource.getConnection()) {
            BaseConnection pgConn = conn.unwrap(BaseConnection.class);
            CopyManager copyManager = new CopyManager(pgConn);
            postgreCopyEngine.processCopyOperation(gzipFilePath, copyManager, sqlCopyCommand, BATCH_SIZE, formatter);
            log.info("{} import completed successfully!", taskName);
        }
        catch (SQLException e){
            log.error("SQL Exception : Failed to import {}", taskName, e);
        }
        catch (Exception e) {
            log.error("Copy process exception: Failed to import {}", taskName, e);
        }
    }

    public void importMovies(String gzipFilePath) {
        String sqlCopyCommand = "COPY imdb.movie FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getMovieDataFormatter(), "Movie");
    }

    public void importPersons(String gzipFilePath) {
        String sqlCopyCommand = "COPY imdb.person FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getPersonDataFormatter(), "Person");
    }

    public void importMovieAlternatives(String gzipFilePath) {
        String sqlCopyCommand = "COPY imdb.movie_alternative FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getMovieAlternativeFormatter(), "Movie Alternative");
    }

    public void importMovieCrews(String gzipFilePath) {
        String sqlCopyCommand = "COPY imdb.movie_crew FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getMovieCrewFormatter(), "Movie Crew");
    }

    public void importMovieEpisodes(String gzipFilePath) {
        String sqlCopyCommand = "COPY imdb.movie_episode FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getNoneFormatter(), "Movie Episode");
    }

    public void importMoviePrincipals(String gzipFilePath) {
        String sqlCopyCommand = "COPY imdb.movie_principal FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getNoneFormatter(), "Movie Principal");
    }

    public void importMovieRatings(String gzipFilePath) {
        String sqlCopyCommand = "COPY imdb.movie_rating FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getNoneFormatter(), "Movie Rating");
    }

}
