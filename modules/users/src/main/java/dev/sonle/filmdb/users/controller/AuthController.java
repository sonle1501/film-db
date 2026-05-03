package dev.sonle.filmdb.users.controller;

//import dev.sonle.filmdb.user.service.AuthService;
//import dev.sonle.filmdb.user.service.LoginRequest;
//import dev.sonle.filmdb.user.service.RegisterRequest;
//import dev.sonle.filmdb.user.service.TokenResponse;
import dev.sonle.filmdb.users.dto.AuthTokensDto;
import dev.sonle.filmdb.users.dto.restdto.LoginRequestDto;
import dev.sonle.filmdb.users.dto.restdto.RegisterRequestDto;
import dev.sonle.filmdb.users.dto.restdto.TokenResponseDto;
import dev.sonle.filmdb.users.model.RefreshToken;
import dev.sonle.filmdb.users.model.UserAuth;
import dev.sonle.filmdb.users.service.AuthService;
import dev.sonle.filmdb.users.service.RefreshTokenService;
import dev.sonle.filmdb.shared.exception.AppException;
import dev.sonle.filmdb.shared.exception.AppExceptionCode;
import dev.sonle.filmdb.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    @Value("${spring.security.refresh-token}")
    private long refreshTokenDurationMs;

    /**
     * POST /api/auth/register
     * Expects JSON format: { "username": "son", "password": "password123" }
     */
    @PostMapping("/register")
    public ResponseEntity<TokenResponseDto> register(
            @RequestBody RegisterRequestDto request
    ) {
        AuthTokensDto tokens = authService.register(request);
        HttpHeaders headers = authService.createCookieHeader(tokens.refreshToken(), refreshTokenDurationMs);
        return ResponseEntity.ok().headers(headers).body(new TokenResponseDto(tokens.accessToken()));
    }

    /**
     * POST /api/auth/login
     * Expects JSON: { "username": "son", "password": "password123" }
     */
    @PostMapping("/login")
    public ResponseEntity<TokenResponseDto> login(
            @RequestBody LoginRequestDto request
    ) {
        AuthTokensDto tokens = authService.login(request);
        HttpHeaders headers = authService.createCookieHeader(tokens.refreshToken(), refreshTokenDurationMs);
        return ResponseEntity.ok().headers(headers).body(new TokenResponseDto(tokens.accessToken()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDto> refresh(
            @CookieValue(name = "refresh_jwt", required = false) String refreshToken
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new AppException(AppExceptionCode.UNAUTHORIZED, "Refresh token is missing");
        }

        return refreshTokenService.findByToken(refreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUserAuth)
                .map(user -> {
                    String accessToken = jwtService.generateToken(user);
                    return ResponseEntity.ok(new TokenResponseDto(accessToken));
                })
                .orElseThrow(() -> new AppException(AppExceptionCode.UNAUTHORIZED, "Refresh token is not in database"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserAuth userAuth) {
            refreshTokenService.deleteByUserAuthId(userAuth.getUserId());
        }

        HttpHeaders headers = authService.createCookieHeader("", 0);
        return ResponseEntity.ok().headers(headers).build();
    }
}