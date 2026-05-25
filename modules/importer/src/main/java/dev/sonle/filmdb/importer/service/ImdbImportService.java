package dev.sonle.filmdb.importer.service;

import dev.sonle.filmdb.importer.core.PostgreArrayFormatter;
import dev.sonle.filmdb.importer.core.PostgreCopyEngine;
import dev.sonle.filmdb.shared.exception.AppException;
import dev.sonle.filmdb.shared.exception.AppExceptionCode;
import org.postgresql.copy.CopyManager;
import org.postgresql.core.BaseConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.function.Consumer;

@Service
public class ImdbImportService {
    private static final Logger log = LoggerFactory.getLogger(ImdbImportService.class);
    private final DataSource dataSource;
    private final PostgreCopyEngine postgreCopyEngine;
    private final PostgreArrayFormatter postgreArrayFormatter;
    private static final int BATCH_SIZE = 100_000;

    @Value("classpath:db/script/swap_staging_tables.sql")
    private Resource swapScript;

    ImdbImportService(DataSource dataSource, PostgreCopyEngine postgreCopyEngine, PostgreArrayFormatter postgreArrayFormatter){
        this.dataSource = dataSource;
        this.postgreCopyEngine = postgreCopyEngine;
        this.postgreArrayFormatter = postgreArrayFormatter;
    }

    private void importData(String gzipFilePath, String sqlCopyCommand, PostgreArrayFormatter.ArrayFormatter formatter, String taskName, java.util.function.Consumer<Double> progressCallback){
        log.info("Starting stream import for {} from: {}", taskName, gzipFilePath);
        try (Connection conn = dataSource.getConnection()) {
            BaseConnection pgConn = conn.unwrap(BaseConnection.class);
            CopyManager copyManager = new CopyManager(pgConn);
            postgreCopyEngine.processCopyOperation(gzipFilePath, copyManager, sqlCopyCommand, BATCH_SIZE, formatter, progressCallback);
            log.info("{} import completed successfully!", taskName);
        }
        catch (SQLException e){
            log.error("SQL Exception: Failed to import {}", taskName, e);
            throw new AppException(AppExceptionCode.DATABASE_ERROR, "SQL Exception: Failed to import " + taskName + ": " + e.getMessage());
        }
        catch (Exception e) {
            log.error("Copy process exception: Failed to import {}", taskName, e);
            throw new AppException(AppExceptionCode.IMPORT_TASK_ERROR, "Copy process exception: Failed to import " + taskName + ": " + e.getMessage());
        }
    }

    public void importMovies(String gzipFilePath, Consumer<Double> progressCallback) {
        String sqlCopyCommand = "COPY imdb.movie_staging FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getMovieDataFormatter(), "Movie", progressCallback);
    }

    public void importPersons(String gzipFilePath, Consumer<Double> progressCallback) {
        String sqlCopyCommand = "COPY imdb.person_staging FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getPersonDataFormatter(), "Person", progressCallback);
    }

    public void importMovieAlternatives(String gzipFilePath, Consumer<Double> progressCallback) {
        String sqlCopyCommand = "COPY imdb.movie_alternative_staging FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getMovieAlternativeFormatter(), "Movie Alternative", progressCallback);
    }

    public void importMovieCrews(String gzipFilePath, Consumer<Double> progressCallback) {
        String sqlCopyCommand = "COPY imdb.movie_crew_staging FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getMovieCrewFormatter(), "Movie Crew", progressCallback);
    }

    public void importMovieEpisodes(String gzipFilePath, Consumer<Double> progressCallback) {
        String sqlCopyCommand = "COPY imdb.movie_episode_staging FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getNoneFormatter(), "Movie Episode", progressCallback);
    }

    public void importMoviePrincipals(String gzipFilePath, Consumer<Double> progressCallback) {
        String sqlCopyCommand = "COPY imdb.movie_principal_staging FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getNoneFormatter(), "Movie Principal", progressCallback);
    }

    public void importMovieRatings(String gzipFilePath, Consumer<Double> progressCallback) {
        String sqlCopyCommand = "COPY imdb.movie_rating_staging FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";
        importData(gzipFilePath, sqlCopyCommand, postgreArrayFormatter.getNoneFormatter(), "Movie Rating", progressCallback);
    }

    public void swapStagingWithActive() {
        log.info("Executing atomic rename swap for imdb tables and indexes from external script...");
        String sql;
        try (InputStream is = swapScript.getInputStream()) {
            sql = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to read swap SQL script", e);
            throw new AppException(AppExceptionCode.INTERNAL_SERVER_ERROR, "Failed to read swap SQL script: " + e.getMessage());
        }

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try (Statement st = conn.createStatement()) {
                st.execute(sql);
                conn.commit();
                log.info("Successfully completed atomic rename swap transaction.");
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        } catch (SQLException e) {
            log.error("SQL Exception: Failed to execute atomic rename swap", e);
            throw new AppException(AppExceptionCode.DATABASE_ERROR, "Failed to complete atomic rename swap: " + e.getMessage());
        } catch (Exception e) {
            log.error("Exception: Failed to execute atomic rename swap", e);
            throw new AppException(AppExceptionCode.INTERNAL_SERVER_ERROR, "Failed to complete atomic rename swap: " + e.getMessage());
        }
    }
}
