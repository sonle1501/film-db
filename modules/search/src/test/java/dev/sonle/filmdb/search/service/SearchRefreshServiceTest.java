package dev.sonle.filmdb.search.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchRefreshServiceTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private Connection connection;

    @Mock
    private Statement checkStatement;

    @Mock
    private Statement refreshStatement;

    @Mock
    private ResultSet resultSet;

    private SearchRefreshService searchRefreshService;

    @BeforeEach
    void setUp() throws SQLException {
        searchRefreshService = new SearchRefreshService(dataSource);
    }

    @Test
    void shouldRefreshConcurrentlyWhenMaterializedViewIsPopulated() throws SQLException {
        when(dataSource.getConnection()).thenReturn(connection);
        // First statement created for checking population status
        // Second statement created for executing the refresh
        when(connection.createStatement())
                .thenReturn(checkStatement)
                .thenReturn(refreshStatement);
        when(checkStatement.executeQuery(anyString())).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(true);
        when(resultSet.getBoolean("relispopulated")).thenReturn(true);

        searchRefreshService.refreshSearch();

        verify(refreshStatement, times(1)).execute("REFRESH MATERIALIZED VIEW CONCURRENTLY search.movie_search");
        verify(refreshStatement, never()).execute("REFRESH MATERIALIZED VIEW search.movie_search");
    }

    @Test
    void shouldRefreshFullyWhenMaterializedViewIsNotPopulated() throws SQLException {
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.createStatement())
                .thenReturn(checkStatement)
                .thenReturn(refreshStatement);
        when(checkStatement.executeQuery(anyString())).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(true);
        when(resultSet.getBoolean("relispopulated")).thenReturn(false);

        searchRefreshService.refreshSearch();

        verify(refreshStatement, never()).execute("REFRESH MATERIALIZED VIEW CONCURRENTLY search.movie_search");
        verify(refreshStatement, times(1)).execute("REFRESH MATERIALIZED VIEW search.movie_search");
    }

    @Test
    void shouldRefreshFullyWhenPopulationCheckReturnsNoRows() throws SQLException {
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.createStatement())
                .thenReturn(checkStatement)
                .thenReturn(refreshStatement);
        when(checkStatement.executeQuery(anyString())).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(false); // No rows returned, defaults to isPopulated = false

        searchRefreshService.refreshSearch();

        verify(refreshStatement, never()).execute("REFRESH MATERIALIZED VIEW CONCURRENTLY search.movie_search");
        verify(refreshStatement, times(1)).execute("REFRESH MATERIALIZED VIEW search.movie_search");
    }

    @Test
    void shouldThrowRuntimeExceptionWhenSQLExceptionOccurs() throws SQLException {
        when(dataSource.getConnection()).thenThrow(new SQLException("Database connection lost"));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                searchRefreshService.refreshSearch()
        );

        assertTrue(exception.getMessage().contains("Materialized view refresh failed"));
        assertEquals(SQLException.class, exception.getCause().getClass());
    }
}
