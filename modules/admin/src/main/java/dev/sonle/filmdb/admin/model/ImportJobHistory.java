package dev.sonle.filmdb.admin.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "import_job_history", schema = "admin")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportJobHistory {

    @Id
    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type")
    private ImportJobType jobType;

    @Column(name = "target_dataset", length = 100)
    private String targetDataset;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ImportJobStatus status;

    @Column(name = "rows_processed")
    private Long rowsProcessed;

    @CreationTimestamp
    @Column(name = "start_time", updatable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "triggered_by")
    private UUID triggeredBy;

    @Column(name = "progress")
    private Double progress;

    @Column(name = "current_stage", length = 50)
    private String currentStage;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "logs", columnDefinition = "jsonb")
    private java.util.List<String> logs;
}
