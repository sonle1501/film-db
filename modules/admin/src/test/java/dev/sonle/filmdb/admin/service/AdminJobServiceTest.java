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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminJobServiceTest {

    @Mock
    private PendingRequestRepository pendingRequestRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private AdminJobService adminJobService;

    private UUID initiatorId;
    private UUID taskId;
    private PendingRequest pendingRequest;

    @BeforeEach
    void setUp() {
        adminJobService = new AdminJobService(pendingRequestRepository, eventPublisher);

        initiatorId = UUID.randomUUID();
        taskId = UUID.randomUUID();
        pendingRequest = PendingRequest.builder()
                .taskId(taskId)
                .initiator(initiatorId)
                .targetEntityId(initiatorId.toString())
                .actionType(AdminActionType.ADMIN_APPROVAL)
                .state(PendingRequestState.PENDING)
                .description("Approval request")
                .priority(1)
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Test
    void shouldGetPendingRequestList() {
        when(pendingRequestRepository.findAll()).thenReturn(List.of(pendingRequest));

        List<PendingRequestDto> result = adminJobService.getPendingRequestList();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(taskId, result.get(0).getTaskId());
        assertEquals("Approval request", result.get(0).getDescription());
    }

    @Test
    void shouldApproveAdminRequestSuccessfully() {
        when(pendingRequestRepository.findByTargetEntityIdAndActionTypeAndState(
                initiatorId.toString(),
                AdminActionType.ADMIN_APPROVAL,
                PendingRequestState.PENDING
        )).thenReturn(Optional.of(pendingRequest));

        adminJobService.approveAdminRequest(initiatorId);

        assertEquals(PendingRequestState.APPROVED, pendingRequest.getState());
        verify(pendingRequestRepository, times(1)).save(pendingRequest);
        verify(eventPublisher, times(1)).publishEvent(new AdminApprovalEvent(initiatorId));
    }

    @Test
    void shouldThrowExceptionWhenPendingAdminRequestNotFoundForApproval() {
        when(pendingRequestRepository.findByTargetEntityIdAndActionTypeAndState(
                initiatorId.toString(),
                AdminActionType.ADMIN_APPROVAL,
                PendingRequestState.PENDING
        )).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () ->
                adminJobService.approveAdminRequest(initiatorId)
        );

        assertEquals(BusinessExceptionCode.REJECT_REQUEST, exception.getBusinessExceptionCode());
        verify(pendingRequestRepository, never()).save(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void shouldRejectAdminRequestSuccessfully() {
        when(pendingRequestRepository.findByTargetEntityIdAndActionTypeAndState(
                initiatorId.toString(),
                AdminActionType.ADMIN_APPROVAL,
                PendingRequestState.PENDING
        )).thenReturn(Optional.of(pendingRequest));

        adminJobService.rejectAdminRequest(initiatorId);

        assertEquals(PendingRequestState.REJECTED, pendingRequest.getState());
        verify(pendingRequestRepository, times(1)).save(pendingRequest);
        verify(eventPublisher, times(1)).publishEvent(new AdminRejectedEvent(initiatorId));
    }

    @Test
    void shouldThrowExceptionWhenPendingAdminRequestNotFoundForRejection() {
        when(pendingRequestRepository.findByTargetEntityIdAndActionTypeAndState(
                initiatorId.toString(),
                AdminActionType.ADMIN_APPROVAL,
                PendingRequestState.PENDING
        )).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () ->
                adminJobService.rejectAdminRequest(initiatorId)
        );

        assertEquals(BusinessExceptionCode.REJECT_REQUEST, exception.getBusinessExceptionCode());
        verify(pendingRequestRepository, never()).save(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void shouldBanUser() {
        UUID userId = UUID.randomUUID();

        adminJobService.banUser(userId);

        verify(eventPublisher, times(1)).publishEvent(new SetUserStateEvent(userId, "BANNED"));
    }

    @Test
    void shouldActiveUser() {
        UUID userId = UUID.randomUUID();

        adminJobService.activeUser(userId);

        verify(eventPublisher, times(1)).publishEvent(new SetUserStateEvent(userId, "ACTIVE"));
    }
}
