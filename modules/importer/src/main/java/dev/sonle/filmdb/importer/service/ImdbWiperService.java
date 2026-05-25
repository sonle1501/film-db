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
public class ImdbWiperService {
    private static final Logger log = LoggerFactory.getLogger(ImdbWiperService.class);
    private final DataSource dataSource;

    @Value("classpath:db/script/wipe_staging_tables.sql")
    private Resource wipeScript;

    public ImdbWiperService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void wipeStagingData() {
        log.info("Starting to wipe all data from imdb staging tables...");
        String sql;
        try (InputStream is = wipeScript.getInputStream()) {
            sql = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to read wipe SQL script", e);
            throw new AppException(AppExceptionCode.INTERNAL_SERVER_ERROR, "Failed to read wipe SQL script: " + e.getMessage());
        }
        
        try (Connection conn = dataSource.getConnection();
             Statement st = conn.createStatement()) {
             st.execute(sql);
             log.info("Successfully wiped all data from imdb staging tables.");
        } catch (SQLException e) {
            log.error("SQL Exception: Failed to wipe imdb staging tables data", e);
            throw new AppException(AppExceptionCode.DATABASE_ERROR, "Failed to wipe imdb staging tables data: " + e.getMessage());
        }
        catch (Exception e) {
            log.error("Runtime Exception: Failed to wipe imdb staging tables data", e);
            throw new AppException(AppExceptionCode.INTERNAL_SERVER_ERROR, "Failed to wipe imdb staging tables data: " + e.getMessage());
        }
    }
}
