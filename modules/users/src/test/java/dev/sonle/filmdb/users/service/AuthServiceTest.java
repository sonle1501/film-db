package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.config.SecurityProperties;
import dev.sonle.filmdb.shared.event.RegisterAdminEvent;
import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.shared.security.JwtService;
import dev.sonle.filmdb.users.dto.AuthTokensDto;
import dev.sonle.filmdb.users.dto.restdto.ChangeUsernameRequestDto;
import dev.sonle.filmdb.users.dto.restdto.LoginRequestDto;
import dev.sonle.filmdb.users.dto.restdto.RegisterRequestDto;
import dev.sonle.filmdb.users.model.RefreshToken;
import dev.sonle.filmdb.users.model.Role;
import dev.sonle.filmdb.users.model.UserAuth;
import dev.sonle.filmdb.users.model.UserState;
import dev.sonle.filmdb.users.repository.UserAuthRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserAuthRepository userAuthRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserValidator userValidator;
    @Mock
    private UserProfileService userProfileService;
    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userAuthRepository,
                passwordEncoder,
                jwtService,
                authenticationManager,
                userValidator,
                userProfileService,
                refreshTokenService,
                eventPublisher
        );
    }

    @Test
    void shouldRegisterUserSuccessfully() {
        RegisterRequestDto request = new RegisterRequestDto("testuser", "password");
        
        when(passwordEncoder.encode("password")).thenReturn("encoded_password");
        when(jwtService.generateToken(any(UserAuth.class))).thenReturn("jwt-token");
        
        RefreshToken mockToken = RefreshToken.builder().token("refresh-token").build();
        when(refreshTokenService.createRefreshToken(any())).thenReturn(mockToken);

        AuthTokensDto result = authService.register(request);

        assertNotNull(result);
        assertEquals("jwt-token", result.accessToken());
        assertEquals("refresh-token", result.refreshToken());

        verify(userValidator, times(1)).validateUsernameAndPassword("testuser", "password");
        
        ArgumentCaptor<UserAuth> userCaptor = ArgumentCaptor.forClass(UserAuth.class);
        verify(userAuthRepository, times(1)).save(userCaptor.capture());
        
        UserAuth savedUser = userCaptor.getValue();
        assertEquals("testuser", savedUser.getUsername());
        assertEquals("encoded_password", savedUser.getPassword());
        assertEquals(Role.USER, savedUser.getRole());
        assertEquals(UserState.ACTIVE, savedUser.getUserState());

        verify(userProfileService, times(1)).syncUserProfile(savedUser);
    }

    @Test
    void shouldRegisterAdminUserSuccessfully() {
        RegisterRequestDto request = new RegisterRequestDto("adminuser", "password");
        
        when(passwordEncoder.encode("password")).thenReturn("encoded_password");
        when(jwtService.generateToken(any(UserAuth.class))).thenReturn("jwt-token");
        
        RefreshToken mockToken = RefreshToken.builder().token("refresh-token").build();
        when(refreshTokenService.createRefreshToken(any())).thenReturn(mockToken);

        AuthTokensDto result = authService.registerAdmin(request);

        assertNotNull(result);
        assertEquals("jwt-token", result.accessToken());
        assertEquals("refresh-token", result.refreshToken());

        verify(userValidator, times(1)).validateUsernameAndPassword("adminuser", "password");
        
        ArgumentCaptor<UserAuth> userCaptor = ArgumentCaptor.forClass(UserAuth.class);
        verify(userAuthRepository, times(1)).save(userCaptor.capture());
        
        UserAuth savedUser = userCaptor.getValue();
        assertEquals("adminuser", savedUser.getUsername());
        assertEquals(Role.USER, savedUser.getRole());
        assertEquals(UserState.ADMIN_PENDING, savedUser.getUserState());

        verify(eventPublisher, times(1)).publishEvent(any(RegisterAdminEvent.class));
    }

    @Test
    void shouldRequestAdminRoleSuccessfully() {
        UUID userId = UUID.randomUUID();
        UserAuth user = UserAuth.builder().userId(userId).role(Role.USER).build();
        when(userAuthRepository.findById(userId)).thenReturn(Optional.of(user));

        authService.requestAdminRole(userId);

        assertEquals(UserState.ADMIN_PENDING, user.getUserState());
        verify(userAuthRepository, times(1)).save(user);
        verify(eventPublisher, times(1)).publishEvent(new RegisterAdminEvent(userId));
    }

    @Test
    void shouldThrowExceptionWhenUserAlreadyAdminOnRequestAdminRole() {
        UUID userId = UUID.randomUUID();
        UserAuth user = UserAuth.builder().userId(userId).role(Role.ADMIN).build();
        when(userAuthRepository.findById(userId)).thenReturn(Optional.of(user));

        BusinessException exception = assertThrows(BusinessException.class, () ->
                authService.requestAdminRole(userId)
        );

        assertEquals(BusinessExceptionCode.REJECT_REQUEST, exception.getBusinessExceptionCode());
        verify(userAuthRepository, never()).save(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void shouldLoginSuccessfully() {
        LoginRequestDto request = new LoginRequestDto("testuser", "password");
        UUID userId = UUID.randomUUID();
        UserAuth user = UserAuth.builder().userId(userId).username("testuser").build();

        when(userAuthRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-token");
        
        RefreshToken mockToken = RefreshToken.builder().token("refresh-token").build();
        when(refreshTokenService.createRefreshToken(userId)).thenReturn(mockToken);

        AuthTokensDto result = authService.login(request);

        assertNotNull(result);
        assertEquals("jwt-token", result.accessToken());
        assertEquals("refresh-token", result.refreshToken());

        verify(authenticationManager, times(1)).authenticate(
                new UsernamePasswordAuthenticationToken("testuser", "password")
        );
    }

    @Test
    void shouldThrowExceptionOnLoginAuthenticationFailure() {
        LoginRequestDto request = new LoginRequestDto("testuser", "wrong-password");
        
        doThrow(new AuthenticationException("Bad credentials") {}).when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        BusinessException exception = assertThrows(BusinessException.class, () ->
                authService.login(request)
        );

        assertEquals(BusinessExceptionCode.INVALID_INPUT, exception.getBusinessExceptionCode());
        verifyNoInteractions(userAuthRepository);
    }

    @Test
    void shouldChangeUsernameSuccessfully() {
        ChangeUsernameRequestDto request = new ChangeUsernameRequestDto("olduser", "password", "newuser");
        UUID userId = UUID.randomUUID();
        UserAuth user = UserAuth.builder().userId(userId).username("olduser").build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userAuthRepository.findByUsername("newuser")).thenReturn(Optional.empty());
        when(userAuthRepository.findByUsername("olduser")).thenReturn(Optional.of(user));

        authService.changeUsername(request);

        assertEquals("newuser", user.getUsername());
        verify(userAuthRepository, times(1)).save(user);
        verify(userProfileService, times(1)).updateUsername(userId, "newuser");
    }

    @Test
    void shouldThrowExceptionWhenNewUsernameAlreadyExistsOnUsernameChange() {
        ChangeUsernameRequestDto request = new ChangeUsernameRequestDto("olduser", "password", "existinguser");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userAuthRepository.findByUsername("existinguser")).thenReturn(Optional.of(new UserAuth()));

        BusinessException exception = assertThrows(BusinessException.class, () ->
                authService.changeUsername(request)
        );

        assertEquals(BusinessExceptionCode.USER_ALREADY_EXISTS, exception.getBusinessExceptionCode());
        verify(userAuthRepository, never()).save(any());
    }

    @Test
    void shouldSetUserStateSuccessfully() {
        UUID userId = UUID.randomUUID();
        UserAuth user = UserAuth.builder().userId(userId).userState(UserState.ACTIVE).build();
        when(userAuthRepository.findById(userId)).thenReturn(Optional.of(user));

        authService.setUserState(userId, "BANNED");

        assertEquals(UserState.BANNED, user.getUserState());
        verify(userAuthRepository, times(1)).save(user);
    }

    @Test
    void shouldSetUserRoleSuccessfully() {
        UUID userId = UUID.randomUUID();
        UserAuth user = UserAuth.builder().userId(userId).role(Role.USER).build();
        when(userAuthRepository.findById(userId)).thenReturn(Optional.of(user));

        authService.setUserRole(userId, "ADMIN");

        assertEquals(Role.ADMIN, user.getRole());
        verify(userAuthRepository, times(1)).save(user);
    }

    @Test
    void shouldCreateCookieHeaderCorrectly() {
        String token = "some-refresh-token";
        long maxAge = 604800000L; // 7 days in ms

        HttpHeaders headers = authService.createCookieHeader(token, maxAge);

        assertNotNull(headers);
        assertTrue(headers.containsKey(HttpHeaders.SET_COOKIE));
        String cookieVal = headers.getFirst(HttpHeaders.SET_COOKIE);
        assertNotNull(cookieVal);
        assertTrue(cookieVal.contains("refresh_jwt=" + token));
        assertTrue(cookieVal.contains("Max-Age=" + (maxAge / 1000)));
        assertTrue(cookieVal.contains("HttpOnly"));
        assertTrue(cookieVal.contains("Secure"));
        assertTrue(cookieVal.contains("SameSite=Strict"));
        assertTrue(cookieVal.contains("Path=/api/auth/refresh"));
    }
}
