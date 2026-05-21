package dev.sonle.filmdb.admin.repository;

import dev.sonle.filmdb.admin.model.AdminActionType;
import dev.sonle.filmdb.admin.model.PendingRequest;
import dev.sonle.filmdb.admin.model.PendingRequestState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PendingRequestRepository extends JpaRepository<PendingRequest, UUID> {
    boolean existsByTargetEntityIdAndActionTypeAndState(String targetEntityId, AdminActionType actionType, PendingRequestState state);
    
    Optional<PendingRequest> findByTargetEntityIdAndActionTypeAndState(String targetEntityId, AdminActionType actionType, PendingRequestState state);
    
    long countByInitiatorAndActionType(UUID initiator, AdminActionType actionType);
}
