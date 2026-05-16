package dev.sonle.filmdb.admin.repository;

import dev.sonle.filmdb.admin.model.ImportJobHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ImportJobHistoryRepository extends JpaRepository<ImportJobHistory, UUID> {
}
