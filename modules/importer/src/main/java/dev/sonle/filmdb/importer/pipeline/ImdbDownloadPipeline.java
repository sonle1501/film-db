package dev.sonle.filmdb.importer.pipeline;

import dev.sonle.filmdb.importer.service.ImdbDownloadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RequiredArgsConstructor
@Service
@Slf4j
public class ImdbDownloadPipeline {

    private final ImdbDownloadService imdbDownloadService;

    public void runDownloadPipeline(String baseDir) {
        log.info("Starting Download Pipeline...");

        DatasetInfo[] datasets = DatasetInfo.values();
        ExecutorService executor = Executors.newFixedThreadPool(datasets.length);

        CompletableFuture<?>[] futures = Arrays.stream(datasets)
                .map(datasetInfo -> CompletableFuture.runAsync(() -> runTask(datasetInfo, baseDir), executor))
                .toArray(CompletableFuture[]::new);

        CompletableFuture.allOf(futures).join();
        executor.shutdown();

        log.info("Download Pipeline finished");
    }

    private void runTask(DatasetInfo datasetInfo, String baseDir) {
        String name = datasetInfo.getFileName();
        Path path = datasetInfo.getFilePath(baseDir);
        System.out.println(path);
        imdbDownloadService.downloadDataset(path, name);
    }

    public static void main(String[] args) {
//        new ImdbDownloadPipeline().test();
    }

}
