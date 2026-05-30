package dev.sonle.filmdb.search.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchRefreshService {

    private final DataSource dataSource;

    public void refreshSearch() {
        log.info("Starting refresh of search materialized view...");
        try (Connection conn = dataSource.getConnection()) {
            boolean isPopulated = false;
            String checkSql = "SELECT relispopulated FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'search' AND c.relname = 'movie_search'";
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(checkSql)) {
                if (rs.next()) {
                    isPopulated = rs.getBoolean("relispopulated");
                }
            }

            try (Statement stmt = conn.createStatement()) {
                if (isPopulated) {
                    log.info("Materialized view is populated. Refreshing concurrently...");
                    stmt.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY search.movie_search");
                    log.info("Successfully refreshed search materialized view concurrently.");
                } else {
                    log.info("Materialized view is not populated. Performing full refresh...");
                    stmt.execute("REFRESH MATERIALIZED VIEW search.movie_search");
                    log.info("Successfully refreshed search materialized view.");
                }
            }
        } catch (Exception e) {
            log.error("Failed to refresh search materialized view", e);
            throw new RuntimeException("Materialized view refresh failed", e);
        }
    }
}
