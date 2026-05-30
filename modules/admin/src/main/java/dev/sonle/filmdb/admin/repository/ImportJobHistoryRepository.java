package dev.sonle.filmdb.admin.repository;

import dev.sonle.filmdb.admin.model.ImportJobHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ImportJobHistoryRepository extends JpaRepository<ImportJobHistory, UUID> {

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @org.springframework.data.jpa.repository.Query("UPDATE ImportJobHistory j SET j.progress = :progress, j.currentStage = :stage, j.status = :status, j.endTime = :endTime, j.errorMessage = :errorMessage WHERE j.jobId = :jobId")
    void updateJobStatus(
            @org.springframework.data.repository.query.Param("jobId") UUID jobId,
            @org.springframework.data.repository.query.Param("stage") String stage,
            @org.springframework.data.repository.query.Param("progress") Double progress,
            @org.springframework.data.repository.query.Param("status") dev.sonle.filmdb.admin.model.ImportJobStatus status,
            @org.springframework.data.repository.query.Param("endTime") java.time.OffsetDateTime endTime,
            @org.springframework.data.repository.query.Param("errorMessage") String errorMessage
    );
}
