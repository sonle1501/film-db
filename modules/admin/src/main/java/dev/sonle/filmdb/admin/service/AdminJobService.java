package dev.sonle.filmdb.admin.service;

import dev.sonle.filmdb.admin.dto.PendingRequestDto;
import dev.sonle.filmdb.admin.model.AdminActionType;
import dev.sonle.filmdb.admin.model.PendingRequest;
import dev.sonle.filmdb.admin.model.PendingRequestState;
import dev.sonle.filmdb.admin.repository.PendingRequestRepository;
import dev.sonle.filmdb.shared.event.AdminApprovalEvent;
import dev.sonle.filmdb.shared.event.AdminRejectedEvent;
import dev.sonle.filmdb.shared.event.SetUserStateEvent;
import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminJobService {

    private final PendingRequestRepository pendingRequestRepository;
    private final ApplicationEventPublisher eventPublisher;

    public List<PendingRequestDto> getPendingRequestList() {
        return pendingRequestRepository.findAll().stream().map(req -> PendingRequestDto.builder()
                .taskId(req.getTaskId())
                .initiator(req.getInitiator())
                .targetEntityId(req.getTargetEntityId())
                .actionType(req.getActionType())
                .state(req.getState())
                .description(req.getDescription())
                .priority(req.getPriority())
                .createdAt(req.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public void approveAdminRequest(UUID userId) {
        PendingRequest request = pendingRequestRepository.findByTargetEntityIdAndActionTypeAndState(
                userId.toString(),
                AdminActionType.ADMIN_APPROVAL,
               PendingRequestState.PENDING
        ).orElseThrow(() -> new BusinessException(BusinessExceptionCode.REJECT_REQUEST, "Pending admin request not found for user: " + userId));

        request.setState(PendingRequestState.APPROVED);
        pendingRequestRepository.save(request);

        eventPublisher.publishEvent(new AdminApprovalEvent(request.getInitiator()));
    }

    @Transactional
    public void rejectAdminRequest(UUID userId) {
        PendingRequest request = pendingRequestRepository.findByTargetEntityIdAndActionTypeAndState(
                userId.toString(),
                AdminActionType.ADMIN_APPROVAL,
                PendingRequestState.PENDING
        ).orElseThrow(() -> new BusinessException(BusinessExceptionCode.REJECT_REQUEST, "Pending admin request not found for user: " + userId));

        request.setState(PendingRequestState.REJECTED);
        pendingRequestRepository.save(request);

        eventPublisher.publishEvent(new AdminRejectedEvent(request.getInitiator()));
    }

    @Transactional
    public void banUser(UUID userId) {
        eventPublisher.publishEvent(new SetUserStateEvent(userId, "BANNED"));
    }

    @Transactional
    public void activeUser(UUID userId) {
        eventPublisher.publishEvent(new SetUserStateEvent(userId, "ACTIVE"));
    }
}
