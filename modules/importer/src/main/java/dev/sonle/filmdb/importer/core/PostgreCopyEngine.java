package dev.sonle.filmdb.importer.core;

import org.postgresql.copy.CopyManager;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.zip.GZIPInputStream;

@Component
public class PostgreCopyEngine {
    private static final Logger log = LoggerFactory.getLogger(PostgreCopyEngine.class);
    public PostgreCopyEngine(){
    }

    public void processCopyOperation(String gzipFilePath, CopyManager copyManager, String sqlCopyCommand, int BATCH_SIZE, PostgreArrayFormatter.ArrayFormatter formatter) throws Exception{
        try (InputStream fileStream = new FileInputStream(gzipFilePath);
             InputStream gzipStream = new GZIPInputStream(fileStream);
             Reader decoder = new InputStreamReader(gzipStream, StandardCharsets.UTF_8);
             BufferedReader bufferedReader = new BufferedReader(decoder)) {

            String line = bufferedReader.readLine(); // Read, check null and skip the header row
            if (line == null) return;

            StringBuilder batchBuffer = new StringBuilder();
            int linesCount = 0;
            int linesInserted = 0;

            while ((line = bufferedReader.readLine()) != null) {
                // split tsv
                String[] parts = line.split("\t", -1);

                // format arrays that matches Postgre's format
                parts = formatter.format(parts);

                // Rejoin everything and append to buffer
                batchBuffer.append(String.join("\t", parts)).append('\n');
                linesCount++;

                // flush to Postgres process
                if (linesCount >= BATCH_SIZE) {
                    copyManager.copyIn(sqlCopyCommand, new StringReader(batchBuffer.toString()));
                    linesInserted += linesCount;
                    log.info("Inserted {} rows...", linesInserted);

                    batchBuffer.setLength(0);
                    linesCount = 0;
                }
            }

            // 5. Flush remaining rows
            if (linesCount > 0) {
                copyManager.copyIn(sqlCopyCommand, new StringReader(batchBuffer.toString()));
                linesInserted += linesCount;
                log.info("Inserted final batch. Total: {} rows.", linesInserted);
            }
        }
    }

}
