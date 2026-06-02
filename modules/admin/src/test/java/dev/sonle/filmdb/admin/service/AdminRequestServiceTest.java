package dev.sonle.filmdb.admin.service;

import dev.sonle.filmdb.admin.model.AdminActionType;
import dev.sonle.filmdb.admin.model.PendingRequest;
import dev.sonle.filmdb.admin.model.PendingRequestState;
import dev.sonle.filmdb.admin.repository.PendingRequestRepository;
import dev.sonle.filmdb.shared.event.RegisterAdminEvent;
import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminRequestServiceTest {

    @Mock
    private PendingRequestRepository pendingRequestRepository;

    private AdminRequestService adminRequestService;

    @BeforeEach
    void setUp() {
        adminRequestService = new AdminRequestService(pendingRequestRepository);
    }

    @Test
    void shouldQueueApprovalAdminRequestSuccessfully() {
        UUID userId = UUID.randomUUID();
        RegisterAdminEvent event = new RegisterAdminEvent(userId);

        when(pendingRequestRepository.countByInitiatorAndActionType(userId, AdminActionType.ADMIN_APPROVAL))
                .thenReturn(0L);
        when(pendingRequestRepository.existsByTargetEntityIdAndActionTypeAndState(
                userId.toString(),
                AdminActionType.ADMIN_APPROVAL,
                PendingRequestState.PENDING
        )).thenReturn(false);

        adminRequestService.queueApprovalAdminRequest(event);

        ArgumentCaptor<PendingRequest> requestCaptor = ArgumentCaptor.forClass(PendingRequest.class);
        verify(pendingRequestRepository, times(1)).save(requestCaptor.capture());

        PendingRequest savedRequest = requestCaptor.getValue();
        assertNotNull(savedRequest.getTaskId());
        assertEquals(userId, savedRequest.getInitiator());
        assertEquals(userId.toString(), savedRequest.getTargetEntityId());
        assertEquals(AdminActionType.ADMIN_APPROVAL, savedRequest.getActionType());
        assertEquals(PendingRequestState.PENDING, savedRequest.getState());
    }

    @Test
    void shouldThrowExceptionWhenUserHasAlreadySubmittedRequestsTwoOrMoreTimes() {
        UUID userId = UUID.randomUUID();
        RegisterAdminEvent event = new RegisterAdminEvent(userId);

        when(pendingRequestRepository.countByInitiatorAndActionType(userId, AdminActionType.ADMIN_APPROVAL))
                .thenReturn(2L);

        BusinessException exception = assertThrows(BusinessException.class, () ->
                adminRequestService.queueApprovalAdminRequest(event)
        );

        assertEquals(BusinessExceptionCode.REJECT_REQUEST, exception.getBusinessExceptionCode());
        assertTrue(exception.getMessage().contains("already submitted admin approval request 2 or more times"));
        verify(pendingRequestRepository, never()).save(any(PendingRequest.class));
    }

    @Test
    void shouldThrowExceptionWhenRequestIsAlreadyPending() {
        UUID userId = UUID.randomUUID();
        RegisterAdminEvent event = new RegisterAdminEvent(userId);

        when(pendingRequestRepository.countByInitiatorAndActionType(userId, AdminActionType.ADMIN_APPROVAL))
                .thenReturn(1L);
        when(pendingRequestRepository.existsByTargetEntityIdAndActionTypeAndState(
                userId.toString(),
                AdminActionType.ADMIN_APPROVAL,
                PendingRequestState.PENDING
        )).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () ->
                adminRequestService.queueApprovalAdminRequest(event)
        );

        assertEquals(BusinessExceptionCode.REJECT_REQUEST, exception.getBusinessExceptionCode());
        assertTrue(exception.getMessage().contains("already pending"));
        verify(pendingRequestRepository, never()).save(any(PendingRequest.class));
    }
}
