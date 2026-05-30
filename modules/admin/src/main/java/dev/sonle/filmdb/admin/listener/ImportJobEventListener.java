package dev.sonle.filmdb.admin.listener;

import dev.sonle.filmdb.admin.model.ImportJobLog;
import dev.sonle.filmdb.admin.model.ImportJobStatus;
import dev.sonle.filmdb.admin.repository.ImportJobHistoryRepository;
import dev.sonle.filmdb.admin.repository.ImportJobLogRepository;
import dev.sonle.filmdb.shared.event.ImportProgressEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ImportJobEventListener {

    private final ImportJobHistoryRepository historyRepository;
    private final ImportJobLogRepository logRepository;

    @Async
    @EventListener
    @Transactional
    public void handleImportProgress(ImportProgressEvent event) {
        log.debug("Received async import progress event: {}", event);

        // 1. Persist the log statement if message is present
        if (event.message() != null) {
            try {
                logRepository.save(ImportJobLog.builder()
                        .jobId(event.jobId())
                        .message(event.message())
                        .build());
            } catch (Exception e) {
                log.error("Failed to persist import job log for jobId: {}", event.jobId(), e);
            }
        }

        // 2. Perform atomic status update on ImportJobHistory
        try {
            ImportJobStatus status;
            OffsetDateTime endTime = null;
            String errorMessage = null;

            if (event.isFinished()) {
                status = ImportJobStatus.SUCCESS;
                endTime = OffsetDateTime.now();
            } else if (event.isFailed()) {
                status = ImportJobStatus.FAILED;
                endTime = OffsetDateTime.now();
                errorMessage = event.errorMessage();
            } else {
                status = ImportJobStatus.IN_PROGRESS;
            }

            historyRepository.updateJobStatus(
                    event.jobId(),
                    event.stage(),
                    event.progress(),
                    status,
                    endTime,
                    errorMessage
            );
        } catch (Exception e) {
            log.error("Failed to update import job history status for jobId: {}", event.jobId(), e);
        }
    }
}

