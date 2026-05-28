package dev.sonle.filmdb.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.Duration;

@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(
    Jwt jwt
) {
    public record Jwt(
        String secretKey,
        Duration expiration,
        Duration refreshExpiration
    ) {}
}
