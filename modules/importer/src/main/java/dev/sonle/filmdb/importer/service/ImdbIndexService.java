package dev.sonle.filmdb.importer.service;

import dev.sonle.filmdb.shared.exception.AppException;
import dev.sonle.filmdb.shared.exception.AppExceptionCode;
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

@Service
public class ImdbIndexService {
    private static final Logger log = LoggerFactory.getLogger(ImdbIndexService.class);
    private final DataSource dataSource;

    @Value("classpath:db/script/drop_staging_indexes.sql")
    private Resource dropIndexesScript;

    @Value("classpath:db/script/create_staging_indexes.sql")
    private Resource createIndexesScript;

    public ImdbIndexService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void dropStagingIndexes() {
        log.info("Dropping indexes on imdb staging tables...");
        try {
            String sql = readScript(dropIndexesScript);
            executeSql(sql, "Failed to drop indexes on staging tables");
            log.info("Successfully dropped staging indexes.");
        } catch (Exception e) {
            log.error("Failed to execute drop indexes script", e);
            if (e instanceof AppException) throw (AppException) e;
            throw new AppException(AppExceptionCode.INTERNAL_SERVER_ERROR, "Failed to drop staging indexes: " + e.getMessage());
        }
    }

    public void createStagingIndexes() {
        log.info("Recreating indexes on imdb staging tables...");
        try {
            String sql = readScript(createIndexesScript);
            executeSql(sql, "Failed to recreate indexes on staging tables");
            log.info("Successfully recreated staging indexes.");
        } catch (Exception e) {
            log.error("Failed to execute create indexes script", e);
            if (e instanceof AppException) throw (AppException) e;
            throw new AppException(AppExceptionCode.INTERNAL_SERVER_ERROR, "Failed to recreate staging indexes: " + e.getMessage());
        }
    }

    private String readScript(Resource resource) {
        try (InputStream is = resource.getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read SQL script resource: " + e.getMessage(), e);
        }
    }

    private void executeSql(String sql, String errorMessage) {
        try (Connection conn = dataSource.getConnection();
             Statement st = conn.createStatement()) {
            log.debug("Executing SQL script...");
            st.execute(sql);
        } catch (SQLException e) {
            log.error("SQL Exception: {}", errorMessage, e);
            throw new AppException(AppExceptionCode.DATABASE_ERROR, errorMessage + ": " + e.getMessage());
        } catch (Exception e) {
            log.error("Exception: {}", errorMessage, e);
            throw new AppException(AppExceptionCode.INTERNAL_SERVER_ERROR, errorMessage + ": " + e.getMessage());
        }
    }
}
