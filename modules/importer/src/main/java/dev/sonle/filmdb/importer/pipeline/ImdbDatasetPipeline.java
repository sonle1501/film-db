package dev.sonle.filmdb.importer.pipeline;

import dev.sonle.filmdb.importer.service.ImdbWiperService;
import dev.sonle.filmdb.importer.service.ImdbImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImdbDatasetPipeline {

    private final ImdbWiperService dataWiper;
    private final ImdbImportPipeline importPipeline;
    private final ImdbDownloadPipeline downloadPipeline;

    @Value("${spring.dataset.location}")
    private String baseDir;

    public void runPipeline() {
        log.info("Starting IMDB Dataset Pipeline...");
        
        // step1: Wipe out data
        dataWiper.wipeData();
        
        // step2: Download data
        downloadPipeline.runDownloadPipeline(baseDir);

//         step3 : Import Data
        importPipeline.runImportPipeline(baseDir);

        log.info("IMDB Dataset Pipeline finished");
    }
}
