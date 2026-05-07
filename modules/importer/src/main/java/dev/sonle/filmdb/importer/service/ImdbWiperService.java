package dev.sonle.filmdb.importer.service;

import dev.sonle.filmdb.shared.exception.AppException;
import dev.sonle.filmdb.shared.exception.AppExceptionCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Service
public class ImdbWiperService {
    private static final Logger log = LoggerFactory.getLogger(ImdbWiperService.class);
    private final DataSource dataSource;

    public ImdbWiperService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void wipeData() {
        log.info("Starting to wipe all data from imdb schema...");
        String sql = "TRUNCATE TABLE " +
                "imdb.movie, " +
                "imdb.person, " +
                "imdb.movie_alternative, " +
                "imdb.movie_crew, " +
                "imdb.movie_episode, " +
                "imdb.movie_principal, " +
                "imdb.movie_rating;";
        
        try (Connection conn = dataSource.getConnection();
             Statement st = conn.createStatement()) {
            st.execute(sql);
            log.info("Successfully wiped all data from imdb schema.");
        } catch (SQLException e) {
            log.error("SQL Exception: Failed to wipe imdb schema data", e);
            throw new AppException(AppExceptionCode.DATABASE_ERROR, "Failed to wipe imdb schema data");
        }
        catch (Exception e) {
            log.error("Runtime Exception: Failed to wipe imdb schema data", e);
            throw new AppException(AppExceptionCode.INTERNAL_SERVER_ERROR, "Failed to wipe imdb schema data");
        }
    }
}
