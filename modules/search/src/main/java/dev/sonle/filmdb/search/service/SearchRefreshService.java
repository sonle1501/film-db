package dev.sonle.filmdb.search.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchRefreshService {

    private final DataSource dataSource;

    public void refreshSearch() {
        log.info("Starting concurrent refresh of search materialized view...");
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY search.movie_search");
            log.info("Successfully refreshed search materialized view concurrently.");
        } catch (Exception e) {
            log.error("Failed to refresh search materialized view concurrently", e);
            throw new RuntimeException("Materialized view refresh failed", e);
        }
    }
}
