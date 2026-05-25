package dev.sonle.filmdb.importer.pipeline;

import dev.sonle.filmdb.importer.service.ImdbDownloadService;
import dev.sonle.filmdb.shared.event.ImportProgressEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RequiredArgsConstructor
@Service
@Slf4j
public class ImdbDownloadPipeline {

    private final ImdbDownloadService imdbDownloadService;
    private final ApplicationEventPublisher eventPublisher;

    public void runDownloadPipeline(String baseDir, UUID jobId) {
        log.info("Starting Download Pipeline...");

        DatasetInfo[] datasets = DatasetInfo.values();
        ExecutorService executor = Executors.newFixedThreadPool(datasets.length);

        ConcurrentHashMap<String, Long> downloadedBytes = new ConcurrentHashMap<>();
        ConcurrentHashMap<String, Long> totalBytes = new ConcurrentHashMap<>();

        // Initialize maps
        for (DatasetInfo dataset : datasets) {
            downloadedBytes.put(dataset.getFileName(), 0L);
            totalBytes.put(dataset.getFileName(), 0L);
        }

        CompletableFuture<?>[] futures = Arrays.stream(datasets)
                .map(datasetInfo -> CompletableFuture.runAsync(() -> {
                    String name = datasetInfo.getFileName();
                    Path path = datasetInfo.getFilePath(baseDir);
                    imdbDownloadService.downloadDataset(path, name, (bytesRead, total) -> {
                        downloadedBytes.put(name, bytesRead);
                        if (total > 0) {
                            totalBytes.put(name, total);
                        }

                        // Calculate aggregate percentage
                        long aggregateDownloaded = downloadedBytes.values().stream().mapToLong(Long::longValue).sum();
                        long aggregateTotal = totalBytes.values().stream().mapToLong(Long::longValue).sum();

                        double downloadProgress = 0.0;
                        if (aggregateTotal > 0) {
                            downloadProgress = (double) aggregateDownloaded / aggregateTotal;
                        }

                        // Download phase is weighted 28%, starts at 2% prep baseline
                        double overallProgress = 2.0 + (downloadProgress * 28.0);

                        String msg = String.format("Downloading datasets: %.1f%% (%s / %s total)", 
                                downloadProgress * 100.0,
                                convertSize(aggregateDownloaded),
                                convertSize(aggregateTotal > 0 ? aggregateTotal : aggregateDownloaded));

                        eventPublisher.publishEvent(dev.sonle.filmdb.shared.event.ImportProgressEvent.progress(
                                jobId, "DOWNLOADING", overallProgress, msg));
                    });
                }, executor))
                .toArray(CompletableFuture[]::new);

        CompletableFuture.allOf(futures).join();
        executor.shutdown();

        // Final event for download completion
        eventPublisher.publishEvent(ImportProgressEvent.progress(
                jobId, "DOWNLOADING", 30.0, "All datasets downloaded successfully."));
        log.info("Download Pipeline finished");
    }

    private String convertSize(long bytes) {
        double sizeInMb = (double) bytes / (1024L * 1024L);
        return String.format("%.2f MB", sizeInMb);
    }

    public static void main(String[] args) {
//        new ImdbDownloadPipeline().test();
    }

}
