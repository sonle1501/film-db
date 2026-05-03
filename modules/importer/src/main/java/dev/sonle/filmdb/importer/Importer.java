package dev.sonle.filmdb.importer;

import org.postgresql.copy.CopyManager;
import org.postgresql.core.BaseConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.util.zip.GZIPInputStream;

@Component
public class Importer {

    private static final Logger log = LoggerFactory.getLogger(Importer.class);
    private final DataSource dataSource;

    // Buffer size: 50,000 rows is a sweet spot for Postgres COPY
    private static final int BATCH_SIZE = 50000;

    // Suppress warning because DataSource is auto-configured by Spring Boot in the main application
    @SuppressWarnings("SpringJavaInjectionPointsAutowiringInspection")
    public Importer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Imports title.basics.tsv.gz into imdb.movie
     */
    public void importMovies(String gzipFilePath) {
        log.info("Starting stream import for Movies from: {}", gzipFilePath);
        String copySql = "COPY imdb.movie FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";

        try (Connection conn = dataSource.getConnection()) {
            BaseConnection pgConn = conn.unwrap(BaseConnection.class);
            CopyManager copyManager = new CopyManager(pgConn);

            processAndCopy(gzipFilePath, copyManager, copySql, parts -> {
                // Movie Transformation Logic
                // parts[8] is 'genres' (e.g., "Action,Drama" -> "{Action,Drama}")
                if (parts.length > 8 && !parts[8].equals("\\N")) {
                    parts[8] = "{" + parts[8] + "}";
                }
                return parts;
            });

            log.info("Movie import completed successfully!");
        } catch (Exception e) {
            log.error("Failed to import movies", e);
        }
    }

    /**
     * Imports name.basics.tsv.gz into imdb.person
     */
    public void importPersons(String gzipFilePath) {
        log.info("Starting stream import for Persons from: {}", gzipFilePath);
        String copySql = "COPY imdb.person FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER false)";

        try (Connection conn = dataSource.getConnection()) {
            BaseConnection pgConn = conn.unwrap(BaseConnection.class);
            CopyManager copyManager = new CopyManager(pgConn);

            processAndCopy(gzipFilePath, copyManager, copySql, parts -> {
                // Person Transformation Logic
                // parts[4] is 'primaryProfession'
                if (parts.length > 4 && !parts[4].equals("\\N")) {
                    parts[4] = "{" + parts[4] + "}";
                }
                // parts[5] is 'knownForTitles'
                if (parts.length > 5 && !parts[5].equals("\\N")) {
                    parts[5] = "{" + parts[5] + "}";
                }
                return parts;
            });

            log.info("Person import completed successfully!");
        } catch (Exception e) {
            log.error("Failed to import persons", e);
        }
    }

    /**
     * The core streaming engine. Streams from GZIP, transforms on the fly, and batches to Postgres.
     */
    private void processAndCopy(String gzipFilePath, CopyManager copyManager, String copySql, LineTransformer transformer) throws Exception {
        try (InputStream fileStream = new FileInputStream(gzipFilePath);
             InputStream gzipStream = new GZIPInputStream(fileStream);
             Reader decoder = new InputStreamReader(gzipStream, StandardCharsets.UTF_8);
             BufferedReader reader = new BufferedReader(decoder)) {

            String line = reader.readLine(); // Read and skip the header row
            if (line == null) return;

            StringBuilder batchBuffer = new StringBuilder();
            int lineCount = 0;
            int totalInserted = 0;

            while ((line = reader.readLine()) != null) {
                // 1. Split TSV line
                String[] parts = line.split("\t", -1);

                // 2. Transform (fixes arrays)
                parts = transformer.transform(parts);

                // 3. Rejoin and add to buffer
                batchBuffer.append(String.join("\t", parts)).append('\n');
                lineCount++;

                // 4. Flush to Postgres when buffer is full
                if (lineCount >= BATCH_SIZE) {
                    copyManager.copyIn(copySql, new StringReader(batchBuffer.toString()));
                    totalInserted += lineCount;
                    log.info("Inserted {} rows...", totalInserted);

                    // Reset buffer
                    batchBuffer.setLength(0);
                    lineCount = 0;
                }
            }

            // 5. Flush any remaining rows
            if (lineCount > 0) {
                copyManager.copyIn(copySql, new StringReader(batchBuffer.toString()));
                totalInserted += lineCount;
                log.info("Inserted final batch. Total: {} rows.", totalInserted);
            }
        }
    }

    // Functional interface for our lambdas
    @FunctionalInterface
    private interface LineTransformer {
        String[] transform(String[] parts);
    }
}