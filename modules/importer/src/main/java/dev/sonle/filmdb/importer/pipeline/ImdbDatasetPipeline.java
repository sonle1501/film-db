package dev.sonle.filmdb.importer.pipeline;

import dev.sonle.filmdb.importer.service.ImdbWiperService;
import dev.sonle.filmdb.importer.service.ImdbImportService;
import dev.sonle.filmdb.importer.service.ImdbIndexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImdbDatasetPipeline {

    private final ImdbWiperService dataWiper;
    private final ImdbImportPipeline importPipeline;
    private final ImdbDownloadPipeline downloadPipeline;
    private final ImdbIndexService indexService;
    private final ImdbImportService importService;

    @Value("${spring.dataset.location}")
    private String baseDir;

    public void runPipeline() {
        log.info("Starting IMDB Dataset Pipeline...");
        
        // Step 1: Wipe staging tables to ensure clean starting state
        dataWiper.wipeStagingData();
        
        // Step 2: Drop staging indexes to optimize bulk ingestion speed
        indexService.dropStagingIndexes();
        
        // Step 3: Download data
        downloadPipeline.runDownloadPipeline(baseDir);

        // Step 4: Import Data (into staging tables)
        importPipeline.runImportPipeline(baseDir);

        // Step 5: Recreate indexes on the staging tables before swapping
        indexService.createStagingIndexes();

        // Step 6: Atomic swap of staging tables with active tables
        importService.swapStagingWithActive();

        // step 7 : clear cache if any

        log.info("IMDB Dataset Pipeline finished");
    }

}
