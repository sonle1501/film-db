package dev.sonle.filmdb.admin.service;

import dev.sonle.filmdb.admin.model.AdminActionType;
import dev.sonle.filmdb.admin.model.PendingRequest;
import dev.sonle.filmdb.admin.model.PendingRequestState;
import dev.sonle.filmdb.admin.repository.PendingRequestRepository;
import dev.sonle.filmdb.shared.event.RegisterAdminEvent;
import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminRequestService {

    private final PendingRequestRepository pendingRequestRepository;

    @Transactional
    @EventListener
    public void queueApprovalAdminRequest(RegisterAdminEvent event) {
        UUID userId = event.userId();
        boolean alreadyQueued = pendingRequestRepository.existsByTargetEntityIdAndActionTypeAndState(
                userId.toString(),
                AdminActionType.ADMIN_APPROVAL,
                PendingRequestState.PENDING
        );

        if (alreadyQueued) {
            throw new BusinessException(BusinessExceptionCode.REJECT_REQUEST,
                    "Admin approval request is already pending for user: " + userId);
        }

        PendingRequest request = PendingRequest.builder()
                .taskId(UUID.randomUUID())
                .initiator(userId)
                .targetEntityId(userId.toString())
                .actionType(AdminActionType.ADMIN_APPROVAL)
                .state(PendingRequestState.PENDING)
                .build();

        pendingRequestRepository.save(request);
    }
}
