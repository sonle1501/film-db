package dev.sonle.filmdb.admin.controller;

import dev.sonle.filmdb.admin.model.ImportJobHistory;
import dev.sonle.filmdb.admin.model.ImportJobStatus;
import dev.sonle.filmdb.admin.model.ImportJobType;
import dev.sonle.filmdb.admin.repository.ImportJobHistoryRepository;
import dev.sonle.filmdb.admin.service.ImportService;
import dev.sonle.filmdb.shared.internal.ImdbDatasetPipelineInterface;
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/admin")
public class ImportController {

    private final ImportService importService;

    @PostMapping("import-pipeline/run")
    public ResponseEntity<ImportJobHistory> adminRunImport() {
        UUID jobId = UUID.randomUUID();
        UUID adminId = getCurrentAdminId();

        ImportJobHistory job = importService.saveNewImportJob(jobId,adminId);
        importService.runPipeline(jobId);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(job);
    }

    @GetMapping("import-pipeline/status")
    public ResponseEntity<ImportJobHistory> getImportStatus(@RequestParam("jobId") UUID jobId) {
        return ResponseEntity.ok(importService.getPipelineStatus(jobId));
    }

    @GetMapping("import-pipeline/history")
    public ResponseEntity<List<ImportJobHistory>> getImportHistory() {
        return ResponseEntity.ok(importService.getPipelineHistory());
    }

    private UUID getCurrentAdminId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) return null;
        try {
            return (UUID) principal.getClass().getMethod("getUserId").invoke(principal);
        } catch (Exception e) {
            return null;
        }
    }
}
