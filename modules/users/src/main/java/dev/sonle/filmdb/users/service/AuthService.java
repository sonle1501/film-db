package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.event.AdminRejectedEvent;
import dev.sonle.filmdb.shared.event.RegisterAdminEvent;
import dev.sonle.filmdb.shared.exception.*;
import dev.sonle.filmdb.shared.security.JwtService;

import dev.sonle.filmdb.users.dto.AuthTokensDto;
import dev.sonle.filmdb.users.dto.restdto.ChangeUsernameRequestDto;
import dev.sonle.filmdb.users.dto.restdto.LoginRequestDto;
import dev.sonle.filmdb.users.dto.restdto.RegisterRequestDto;
import dev.sonle.filmdb.users.model.*;
import dev.sonle.filmdb.users.repository.UserAuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    DaoAuthenticationProvider f;

    private final UserAuthRepository userAuthRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserValidator userValidator;
    private final UserProfileService userProfileService;
    private final RefreshTokenService refreshTokenService;
    private final ApplicationEventPublisher eventPublisher;


    @Transactional
    public AuthTokensDto register(RegisterRequestDto request) {
        userValidator.validateUsernameAndPassword(request.username(), request.password());
        UserAuth userAuth = UserAuth.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER) // Default role
                .build();

        userAuthRepository.save(userAuth);
        userProfileService.syncUserProfile(userAuth);
        
        String jwtToken = jwtService.generateToken(userAuth);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userAuth.getUserId());
        
        return new AuthTokensDto(jwtToken, refreshToken.getToken());
    }

    @Transactional
    public AuthTokensDto registerAdmin(RegisterRequestDto request) {
        userValidator.validateUsernameAndPassword(request.username(), request.password());
        UserAuth userAuth = UserAuth.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .userState(UserState.ADMIN_PENDING)
                .build();

        userAuthRepository.save(userAuth);
        userProfileService.syncUserProfile(userAuth);
        String jwtToken = jwtService.generateToken(userAuth);

        UUID userId = userAuth.getUserId();
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userId);
        eventPublisher.publishEvent(new RegisterAdminEvent(userId));
        return new AuthTokensDto(jwtToken, refreshToken.getToken());
    }

    @Transactional
    public void requestAdminRole(UUID userId) {
        UserAuth userAuth = userAuthRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.USER_NOT_FOUND, "User not found"));

        if (userAuth.getRole() == Role.ADMIN) {
            throw new BusinessException(BusinessExceptionCode.REJECT_REQUEST, "User is already an admin");
        }

        userAuth.setUserState(UserState.ADMIN_PENDING);
        userAuthRepository.save(userAuth);

        eventPublisher.publishEvent(new RegisterAdminEvent(userId));
    }

    @Transactional
    public AuthTokensDto login(LoginRequestDto request) {
        try{
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (AuthenticationException e){
            throw new BusinessException(BusinessExceptionCode.INVALID_INPUT, "Wrong username or password");
        }

        UserAuth user = userAuthRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException(
                        BusinessExceptionCode.USER_NOT_FOUND,
                        "User '" + request.username() + "' not found."
                ));
                
        String jwtToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUserId());
        
        return new AuthTokensDto(jwtToken, refreshToken.getToken());
    }

    @Transactional
    public void changeUsername(ChangeUsernameRequestDto request) {
        try{
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (AuthenticationException e){
            throw new BusinessException(BusinessExceptionCode.INVALID_INPUT, "Wrong username or password");
        }

        if (request.newUsername() == null || request.newUsername().isBlank()) {
            throw new BusinessException(BusinessExceptionCode.INVALID_INPUT, "New username is required");
        }
        if (userAuthRepository.findByUsername(request.newUsername()).isPresent()) {
            throw new BusinessException(BusinessExceptionCode.USER_ALREADY_EXISTS, "Username '" + request.newUsername() + "' is already exist");
        }

        UserAuth userAuth = userAuthRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.USER_NOT_FOUND, "User not found"));
        userAuth.setUsername(request.newUsername());
        userAuthRepository.save(userAuth);

        userProfileService.updateUsername(userAuth.getUserId(), request.newUsername());
    }

    public void setUserState(UUID userId, String st) {
        UserState state = UserState.fromString(st);
        UserAuth userAuth = userAuthRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.REJECT_REQUEST, "Cannot find the user: " + userId));
        userAuth.setUserState(state);
        userAuthRepository.save(userAuth);
    }

    public void setUserRole(UUID userId, String role) {
        Role userRole = Role.fromString(role);
        UserAuth userAuth = userAuthRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.REJECT_REQUEST, "Cannot find the user: " + userId));
        userAuth.setRole(userRole);
        userAuthRepository.save(userAuth);
    }

    public HttpHeaders createCookieHeader(String refreshToken, long maxAge) {
        ResponseCookie cookie = ResponseCookie.from("refresh_jwt", refreshToken)
                .httpOnly(true)
                .secure(true) // can set false in development phase (HTTPS)
                .sameSite("Strict")
                .path("/api/auth/refresh")
                .maxAge(maxAge / 1000)
                .build();
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, cookie.toString());
        return headers;
    }
}
