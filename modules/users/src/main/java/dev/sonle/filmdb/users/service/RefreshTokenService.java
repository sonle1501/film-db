package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.exception.AppException;
import dev.sonle.filmdb.shared.exception.AppExceptionCode;
import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.users.model.RefreshToken;
import dev.sonle.filmdb.users.model.UserAuth;
import dev.sonle.filmdb.users.repository.RefreshTokenRepository;
import dev.sonle.filmdb.users.repository.UserAuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${application.security.jwt.refresh-expiration:604800000}") // 7 days in ms
    private long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserAuthRepository userAuthRepository;

    @Transactional
    public RefreshToken createRefreshToken(UUID userId) {
        UserAuth userAuth = userAuthRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.USER_NOT_FOUND, "Cannot found user authT info"));

        // Ensure one valid token per user
        refreshTokenRepository.deleteByUserAuth(userAuth);

        RefreshToken refreshToken = RefreshToken.builder()
                .userId(userId)
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .token(UUID.randomUUID().toString())
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new AppException(AppExceptionCode.UNAUTHORIZED, "Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    @Transactional
    public void deleteByUserAuthId(UUID userId) {
        UserAuth userAuth = userAuthRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.USER_NOT_FOUND, "Cannot found user authT info"));
        refreshTokenRepository.deleteByUserAuth(userAuth);
    }
}
