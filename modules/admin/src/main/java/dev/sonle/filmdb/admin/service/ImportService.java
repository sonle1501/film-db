package dev.sonle.filmdb.admin.service;

import dev.sonle.filmdb.admin.controller.ImportController;
import dev.sonle.filmdb.admin.model.ImportJobHistory;
import dev.sonle.filmdb.admin.model.ImportJobStatus;
import dev.sonle.filmdb.admin.model.ImportJobType;
import dev.sonle.filmdb.admin.repository.ImportJobHistoryRepository;
import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.shared.internal.ImdbDatasetPipelineInterface;
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class ImportService {

    private final ImdbDatasetPipelineInterface pipeline;
    private final ImportJobHistoryRepository importJobHistoryRepository;

    public ImportJobHistory saveNewImportJob(UUID jobId, UUID adminId){
        ImportJobHistory job = ImportJobHistory.builder()
                .jobId(jobId)
                .jobType(ImportJobType.FULL_WIPE_AND_LOAD)
                .targetDataset("ALL")
                .status(ImportJobStatus.PENDING)
                .progress(0.0)
                .currentStage("PREPARATION")
                .triggeredBy(adminId)
                .startTime(OffsetDateTime.now())
                .logs(new ArrayList<>())
                .build();

        return importJobHistoryRepository.save(job);
    }

    public void runPipeline(UUID jobId) {
        CompletableFuture.runAsync(() -> {
            try {
                pipeline.runPipeline(jobId);
            } catch (Exception e) {
                // If anything escapes the pipeline execution, log it here
                LoggerFactory.getLogger(ImportController.class)
                        .error("Async pipeline execution failed for jobId: {}", jobId, e);
            }
        });
    }

    public ImportJobHistory getPipelineStatus(UUID jobId){
        return importJobHistoryRepository.findById(jobId).orElseThrow(
                ()-> new BusinessException(BusinessExceptionCode.RESOURCE_NOT_FOUND, "Cannot found job with ID: " + jobId));
    }

    public List<ImportJobHistory> getPipelineHistory(){
        return importJobHistoryRepository.findAll();
    }
}


