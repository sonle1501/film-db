package dev.sonle.filmdb.admin.repository;

import dev.sonle.filmdb.admin.model.ImportJobLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ImportJobLogRepository extends JpaRepository<ImportJobLog, Long> {
    List<ImportJobLog> findByJobIdOrderByTimestampAscIdAsc(UUID jobId);
}
