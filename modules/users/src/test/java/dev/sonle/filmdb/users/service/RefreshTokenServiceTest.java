package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.config.SecurityProperties;
import dev.sonle.filmdb.shared.exception.AppException;
import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.users.model.RefreshToken;
import dev.sonle.filmdb.users.model.Role;
import dev.sonle.filmdb.users.model.UserAuth;
import dev.sonle.filmdb.users.model.UserState;
import dev.sonle.filmdb.users.repository.RefreshTokenRepository;
import dev.sonle.filmdb.users.repository.UserAuthRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserAuthRepository userAuthRepository;

    private SecurityProperties securityProperties;
    private RefreshTokenService refreshTokenService;

    private UUID userId;
    private UserAuth userAuth;

    @BeforeEach
    void setUp() {
        SecurityProperties.Jwt jwtConfig = new SecurityProperties.Jwt(
                "Y2hvb25ndGhlbW9uZ2xha2V5c3VwZXJkdXBlcnNlY3JldDEyMzQ1Njc4OTA=",
                Duration.ofMinutes(15),
                Duration.ofDays(7)
        );
        securityProperties = new SecurityProperties(jwtConfig);
        refreshTokenService = new RefreshTokenService(securityProperties, refreshTokenRepository, userAuthRepository);

        userId = UUID.randomUUID();
        userAuth = UserAuth.builder()
                .userId(userId)
                .username("testuser")
                .role(Role.USER)
                .userState(UserState.ACTIVE)
                .build();
    }

    @Test
    void shouldCreateRefreshTokenSuccessfully() {
        when(userAuthRepository.findById(userId)).thenReturn(Optional.of(userAuth));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RefreshToken token = refreshTokenService.createRefreshToken(userId);

        assertNotNull(token);
        assertEquals(userId, token.getUserId());
        assertNotNull(token.getToken());
        assertTrue(token.getExpiryDate().isAfter(Instant.now()));
        
        verify(refreshTokenRepository, times(1)).deleteByUserAuth(userAuth);
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    void shouldThrowExceptionWhenUserNotFoundOnCreate() {
        when(userAuthRepository.findById(userId)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () ->
                refreshTokenService.createRefreshToken(userId)
        );

        assertEquals(BusinessExceptionCode.USER_NOT_FOUND, exception.getBusinessExceptionCode());
        verifyNoInteractions(refreshTokenRepository);
    }

    @Test
    void shouldFindTokenByString() {
        String tokenStr = "some-uuid-token";
        RefreshToken mockToken = RefreshToken.builder().token(tokenStr).build();
        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.of(mockToken));

        Optional<RefreshToken> result = refreshTokenService.findByToken(tokenStr);

        assertTrue(result.isPresent());
        assertEquals(tokenStr, result.get().getToken());
    }

    @Test
    void shouldVerifyValidRefreshTokenSuccessfully() {
        RefreshToken validToken = RefreshToken.builder()
                .token("valid-token")
                .expiryDate(Instant.now().plus(Duration.ofHours(1)))
                .build();

        RefreshToken result = refreshTokenService.verifyExpiration(validToken);

        assertEquals(validToken, result);
        verify(refreshTokenRepository, never()).delete(any());
    }

    @Test
    void shouldDeleteAndThrowExceptionWhenRefreshTokenIsExpired() {
        RefreshToken expiredToken = RefreshToken.builder()
                .token("expired-token")
                .expiryDate(Instant.now().minus(Duration.ofHours(1)))
                .build();

        AppException exception = assertThrows(AppException.class, () ->
                refreshTokenService.verifyExpiration(expiredToken)
        );

        assertTrue(exception.getMessage().contains("expired"));
        verify(refreshTokenRepository, times(1)).delete(expiredToken);
    }

    @Test
    void shouldDeleteByUserAuthIdSuccessfully() {
        when(userAuthRepository.findById(userId)).thenReturn(Optional.of(userAuth));

        refreshTokenService.deleteByUserAuthId(userId);

        verify(refreshTokenRepository, times(1)).deleteByUserAuth(userAuth);
    }

    @Test
    void shouldThrowExceptionWhenUserNotFoundOnDelete() {
        when(userAuthRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () ->
                refreshTokenService.deleteByUserAuthId(userId)
        );

        verifyNoInteractions(refreshTokenRepository);
    }
}
