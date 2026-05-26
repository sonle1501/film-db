package dev.sonle.filmdb.importer.service;

import dev.sonle.filmdb.shared.exception.AppException;
import dev.sonle.filmdb.shared.exception.AppExceptionCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.function.BiConsumer;

@Service
@Slf4j
public class ImdbDownloadService {

    private final String baseImdbDatasetUrl = "https://datasets.imdbws.com/";

    private final HttpClient httpClient;

    public ImdbDownloadService() {
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .connectTimeout(Duration.ofSeconds(15)) // Prevent hanging on connection
                .build();
    }

    public void downloadDataset(Path location, String fileName, BiConsumer<Long, Long> progressCallback) {
        String url = baseImdbDatasetUrl + fileName;

        // temp file to prevent corruption
        Path tempLocation = location.resolveSibling(fileName + ".tmp");

        try {
            log.info("Starting download for {}...", fileName);
            HttpResponse<InputStream> response = makeRequest(url);
            long contentLength = response.headers().firstValueAsLong("Content-Length").orElse(-1L);

            try (InputStream datasetContent = response.body();
                 OutputStream outputStream = Files.newOutputStream(tempLocation)) {
                
                byte[] buffer = new byte[8192];
                int bytesRead;
                long totalBytesRead = 0;
                long lastProgressTime = 0;
                
                while ((bytesRead = datasetContent.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                    totalBytesRead += bytesRead;
                    
                    long now = System.currentTimeMillis();
                    if (now - lastProgressTime > 1000) {
                        if (progressCallback != null) {
                            progressCallback.accept(totalBytesRead, contentLength);
                        }
                        lastProgressTime = now;
                    }
                }
                
                if (progressCallback != null) {
                    progressCallback.accept(totalBytesRead, contentLength);
                }

                outputStream.close();
                Files.move(tempLocation, location, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);

                log.info("Successfully saved {} at {}", convertSize(totalBytesRead), location);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            cleanUpTempFile(tempLocation);
            throw new AppException(AppExceptionCode.IMDB_SERVER_EXCEPTION, "Dataset download was interrupted");
        } catch (IOException e) {
            cleanUpTempFile(tempLocation);
            throw new AppException(AppExceptionCode.IMDB_SERVER_EXCEPTION, "I/O error during download: " + e.getMessage());
        }
    }

    private HttpResponse<InputStream> makeRequest(String url) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .GET()
                .timeout(Duration.ofMinutes(10))
                .header("Accept", "application/x-gzip") //content type for .gz files
                .build();

        HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

        int statusCode = response.statusCode();
        if (statusCode >= 200 && statusCode < 300) {
            return response;
        }
        throw new AppException(AppExceptionCode.IMDB_SERVER_EXCEPTION, "HTTP " + statusCode + " during download from IMDB.");
    }

    private String convertSize(long bytes) {
        // Corrected math: explicitly casting and dividing by 1024 cubed
        double sizeInGb = (double) bytes / (1024L * 1024L * 1024L);
        return String.format("%.2f GB", sizeInGb);
    }

    private void cleanUpTempFile(Path tempLocation) {
        try {
            Files.deleteIfExists(tempLocation);
        } catch (IOException e) {
            log.warn("Failed to delete temporary file: {}", tempLocation, e);
        }
    }
}
