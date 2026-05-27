package dev.sonle.filmdb.search.repository;

import dev.sonle.filmdb.search.dto.MovieSearchResultDto;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Array;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class SearchRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public List<MovieSearchResultDto> searchSmart(String query, int limit, int offset) {
        String sql = """
            WITH q AS (
                SELECT 
                    websearch_to_tsquery('english', :query) as ts_q_eng,
                    websearch_to_tsquery('simple', :query) as ts_q_simp,
                    :query as literal_q,
                    LEAST(1.0, length(:query) / 10.0) as length_scale
            )
            SELECT 
                m.movie_id, 
                m.primary_title, 
                m.original_title, 
                m.title_type, 
                m.start_year, 
                m.genres, 
                m.average_rating, 
                m.num_votes,
                (
                    0.2 * ts_rank_cd(m.main_search_vector, q.ts_q_eng) + 
                    0.4 * ts_rank_cd(m.main_simple_search_vector, q.ts_q_simp) + 
                    0.4 * similarity(m.primary_title, q.literal_q) +
                    (CASE 
                        WHEN length(q.literal_q) >= 3 AND lower(m.primary_title) LIKE lower(q.literal_q) || '%' 
                        THEN 1.0 * q.length_scale 
                        ELSE 0.0 
                     END) +
                    (CASE 
                        WHEN length(q.literal_q) >= 3 AND strpos(lower(m.primary_title), lower(q.literal_q)) > 0 
                        THEN (1.0 / strpos(lower(m.primary_title), lower(q.literal_q))) * q.length_scale 
                        ELSE 0.0 
                     END)
                ) * m.popularity_boost_multiplier as relevance_score
            FROM search.movie_search m, q
            WHERE m.main_search_vector @@ q.ts_q_eng
               OR m.main_simple_search_vector @@ q.ts_q_simp
               OR m.primary_title % q.literal_q
            ORDER BY relevance_score DESC
            LIMIT :limit OFFSET :offset;
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("query", query)
                .addValue("limit", limit)
                .addValue("offset", offset);

        return jdbcTemplate.query(sql, params, (rs, rowNum) -> mapRowToDto(rs));
    }

    public List<MovieSearchResultDto> searchVietnamese(String query, int limit, int offset) {
        String sql = """
            WITH q AS (
                SELECT 
                    websearch_to_tsquery('simple', :query) as ts_q,
                    :query as literal_q,
                    LEAST(1.0, length(:query) / 10.0) as length_scale
            )
            SELECT 
                m.movie_id, 
                m.primary_title, 
                m.original_title, 
                m.title_type, 
                m.start_year, 
                m.genres, 
                m.average_rating, 
                m.num_votes,
                (
                    0.6 * ts_rank_cd(m.vietnamese_search_vector, q.ts_q) + 
                    0.4 * similarity(m.vietnamese_titles_concat, q.literal_q) +
                    (CASE 
                        WHEN length(q.literal_q) >= 3 AND lower(m.vietnamese_titles_concat) LIKE lower(q.literal_q) || '%' 
                        THEN 1.0 * q.length_scale 
                        ELSE 0.0 
                     END) +
                    (CASE 
                        WHEN length(q.literal_q) >= 3 AND strpos(lower(m.vietnamese_titles_concat), lower(q.literal_q)) > 0 
                        THEN (1.0 / strpos(lower(m.vietnamese_titles_concat), lower(q.literal_q))) * q.length_scale 
                        ELSE 0.0 
                     END)
                ) * m.popularity_boost_multiplier as relevance_score
            FROM search.movie_search m, q
            WHERE m.vietnamese_search_vector @@ q.ts_q
               OR m.vietnamese_titles_concat % q.literal_q
            ORDER BY relevance_score DESC
            LIMIT :limit OFFSET :offset;
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("query", query)
                .addValue("limit", limit)
                .addValue("offset", offset);

        return jdbcTemplate.query(sql, params, (rs, rowNum) -> mapRowToDto(rs));
    }

    public List<MovieSearchResultDto> liveSearchSmart(String query, int limit) {
        String sql = """
            SELECT 
                movie_id, primary_title, original_title, title_type, start_year, genres, average_rating, num_votes,
                (
                    0.5 * similarity(primary_title, :query) +
                    (CASE 
                        WHEN length(:query) >= 3 AND lower(primary_title) LIKE lower(:query) || '%' 
                        THEN 1.0 * LEAST(1.0, length(:query) / 10.0) 
                        ELSE 0.0 
                     END) +
                    (CASE 
                        WHEN length(:query) >= 3 AND strpos(lower(primary_title), lower(:query)) > 0 
                        THEN (1.0 / strpos(lower(primary_title), lower(:query))) * LEAST(1.0, length(:query) / 10.0) 
                        ELSE 0.0 
                     END)
                ) * popularity_boost_multiplier as relevance_score
            FROM search.movie_search
            WHERE primary_title ILIKE :prefix_query
               OR primary_title % :query
            ORDER BY relevance_score DESC, num_votes DESC
            LIMIT :limit;
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("query", query)
                .addValue("prefix_query", query + "%")
                .addValue("limit", limit);

        return jdbcTemplate.query(sql, params, (rs, rowNum) -> mapRowToDto(rs));
    }

    public List<MovieSearchResultDto> liveSearchVietnamese(String query, int limit) {
        String sql = """
            SELECT 
                movie_id, primary_title, original_title, title_type, start_year, genres, average_rating, num_votes,
                (
                    0.5 * similarity(vietnamese_titles_concat, :query) +
                    (CASE 
                        WHEN length(:query) >= 3 AND lower(vietnamese_titles_concat) LIKE lower(:query) || '%' 
                        THEN 1.0 * LEAST(1.0, length(:query) / 10.0) 
                        ELSE 0.0 
                     END) +
                    (CASE 
                        WHEN length(:query) >= 3 AND strpos(lower(vietnamese_titles_concat), lower(:query)) > 0 
                        THEN (1.0 / strpos(lower(vietnamese_titles_concat), lower(:query))) * LEAST(1.0, length(:query) / 10.0) 
                        ELSE 0.0 
                     END)
                ) * popularity_boost_multiplier as relevance_score
            FROM search.movie_search
            WHERE vietnamese_titles_concat ILIKE :prefix_query
               OR vietnamese_titles_concat % :query
            ORDER BY relevance_score DESC, num_votes DESC
            LIMIT :limit;
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("query", query)
                .addValue("prefix_query", query + "%")
                .addValue("limit", limit);

        return jdbcTemplate.query(sql, params, (rs, rowNum) -> mapRowToDto(rs));
    }

    private MovieSearchResultDto mapRowToDto(java.sql.ResultSet rs) throws java.sql.SQLException {
        Array genresArray = rs.getArray("genres");
        List<String> genresList = Collections.emptyList();
        if (genresArray != null) {
            String[] genres = (String[]) genresArray.getArray();
            genresList = Arrays.asList(genres);
        }

        return new MovieSearchResultDto(
                rs.getString("movie_id"),
                rs.getString("primary_title"),
                rs.getString("original_title"),
                rs.getString("title_type"),
                rs.getInt("start_year"),
                genresList,
                rs.getBigDecimal("average_rating"),
                rs.getInt("num_votes"),
                rs.getDouble("relevance_score")
        );
    }
}
