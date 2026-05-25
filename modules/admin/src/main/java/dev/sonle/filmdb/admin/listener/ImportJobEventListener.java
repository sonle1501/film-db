package dev.sonle.filmdb.admin.listener;

import dev.sonle.filmdb.admin.model.ImportJobHistory;
import dev.sonle.filmdb.admin.model.ImportJobStatus;
import dev.sonle.filmdb.admin.repository.ImportJobHistoryRepository;
import dev.sonle.filmdb.shared.event.ImportProgressEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ImportJobEventListener {

    private final ImportJobHistoryRepository repository;

    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleImportProgress(ImportProgressEvent event) {
        log.debug("Received import progress event: {}", event);
        repository.findById(event.jobId()).ifPresentOrElse(job -> {
            job.setProgress(event.progress());
            if (event.stage() != null) {
                job.setCurrentStage(event.stage());
            }

            // Append logs
            List<String> currentLogs = job.getLogs();
            if (currentLogs == null) {
                currentLogs = new ArrayList<>();
            }
            if (event.message() != null) {
                currentLogs.add(event.message());
            }
            job.setLogs(currentLogs);

            if (event.isFinished()) {
                job.setStatus(ImportJobStatus.SUCCESS);
                job.setEndTime(OffsetDateTime.now());
            } else if (event.isFailed()) {
                job.setStatus(ImportJobStatus.FAILED);
                job.setEndTime(OffsetDateTime.now());
                job.setErrorMessage(event.errorMessage());
            } else {
                job.setStatus(ImportJobStatus.IN_PROGRESS);
            }
            repository.save(job);
        }, () -> log.warn("ImportJobHistory not found for jobId: {}", event.jobId()));
    }
}
