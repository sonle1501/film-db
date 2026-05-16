package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.event.AdminRejectedEvent;
import dev.sonle.filmdb.shared.event.SetUserStateEvent;
import dev.sonle.filmdb.users.repository.UserAuthRepository;
import dev.sonle.filmdb.shared.event.AdminApprovalEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventListener {

    private final UserAuthRepository userAuthRepository;
    private final AuthService authService;

    @EventListener
    public void handleAdminApproval(AdminApprovalEvent event) {
        log.info("Received AdminApprovalEvent for User ID: {}", event.initiatorId());

        authService.setUserRole(event.initiatorId(), "ADMIN");
        authService.setUserState(event.initiatorId(), "ACTIVE");
    }

    @EventListener
    public void handleAdminRejected(AdminRejectedEvent event) {
        log.info("Received AdminRejectedEvent for User ID: {}", event.initiatorId());

        authService.setUserRole(event.initiatorId(), "USER");
        authService.setUserState(event.initiatorId(), "ACTIVE");
    }

    @EventListener
    public void handleAdminSetState(SetUserStateEvent event) {
        log.info("Received admin set state request for User ID: {}, with new state: {}",event.userId(), event.state());
        authService.setUserState(event.userId(), event.state());
    }
}
