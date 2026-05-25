package dev.sonle.filmdb.importer.pipeline;

import dev.sonle.filmdb.importer.service.ImdbWiperService;
import dev.sonle.filmdb.importer.service.ImdbImportService;
import dev.sonle.filmdb.importer.service.ImdbIndexService;
import dev.sonle.filmdb.shared.event.ImportProgressEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImdbDatasetPipeline {

    private final ImdbWiperService dataWiper;
    private final ImdbImportPipeline importPipeline;
    private final ImdbDownloadPipeline downloadPipeline;
    private final ImdbIndexService indexService;
    private final ImdbImportService importService;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${spring.dataset.location}")
    private String baseDir;

    public void runPipeline(UUID jobId) {
        log.info("Starting IMDB Dataset Pipeline for jobId: {}...", jobId);
        try {
            // Step 1: Wipe staging tables to ensure clean starting state
            eventPublisher.publishEvent(ImportProgressEvent.progress(
                    jobId, "PREPARATION", 0.0, "Wiping staging data tables..."));
            dataWiper.wipeStagingData();
            eventPublisher.publishEvent(ImportProgressEvent.progress(
                    jobId, "PREPARATION", 1.0, "Staging data wiped successfully."));

            // Step 2: Drop staging indexes to optimize bulk ingestion speed
            indexService.dropStagingIndexes(jobId);

            // Step 3: Download data
            downloadPipeline.runDownloadPipeline(baseDir, jobId);

            // Step 4: Import Data (into staging tables)
            importPipeline.runImportPipeline(baseDir, jobId);

            // Step 5: Recreate indexes on the staging tables before swapping
            indexService.createStagingIndexes(jobId);

            // Step 6: Atomic swap of staging tables with active tables
            eventPublisher.publishEvent(ImportProgressEvent.progress(
                    jobId, "SWAP", 99.0, "Performing atomic swap of staging tables..."));
            importService.swapStagingWithActive();

            // Step 7: Finalize
            eventPublisher.publishEvent(ImportProgressEvent.finished(
                    jobId, "SWAP", "Pipeline finished successfully. Atomic swap complete."));
            log.info("IMDB Dataset Pipeline finished for jobId: {}", jobId);

        } catch (Exception e) {
            log.error("Pipeline failed for jobId: {}", jobId, e);
            eventPublisher.publishEvent(ImportProgressEvent.failed(
                    jobId, "FAILED", e.getMessage() != null ? e.getMessage() : e.toString()));
            throw e;
        }
    }

}
