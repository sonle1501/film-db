package dev.sonle.filmdb.shared.security;

import dev.sonle.filmdb.shared.config.SecurityProperties;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private SecurityProperties securityProperties;
    // A base64 encoded secret key (at least 256 bits for HS256)
    private static final String SECRET_KEY = "Y2hvb25ndGhlbW9uZ2xha2V5c3VwZXJkdXBlcnNlY3JldDEyMzQ1Njc4OTA=";

    @BeforeEach
    void setUp() {
        SecurityProperties.Jwt jwtConfig = new SecurityProperties.Jwt(
                SECRET_KEY,
                Duration.ofMinutes(15),
                Duration.ofDays(7)
        );
        securityProperties = new SecurityProperties(jwtConfig);
        jwtService = new JwtService(securityProperties);
    }

    @Test
    void shouldGenerateAndExtractUsernameCorrectly() {
        UserDetails userDetails = new User("testuser", "password", Collections.emptyList());
        
        String token = jwtService.generateToken(userDetails);
        
        assertNotNull(token);
        String username = jwtService.extractUsername(token);
        assertEquals("testuser", username);
    }

    @Test
    void shouldGenerateTokenWithExtraClaims() {
        UserDetails userDetails = new User("testuser", "password", Collections.emptyList());
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", "ROLE_USER");
        extraClaims.put("userId", "12345");

        String token = jwtService.generateToken(extraClaims, userDetails);
        
        assertNotNull(token);
        assertEquals("testuser", jwtService.extractUsername(token));
        assertEquals("ROLE_USER", jwtService.extractClaim(token, claims -> claims.get("role", String.class)));
        assertEquals("12345", jwtService.extractClaim(token, claims -> claims.get("userId", String.class)));
    }

    @Test
    void shouldValidateCorrectToken() {
        UserDetails userDetails = new User("testuser", "password", Collections.emptyList());
        String token = jwtService.generateToken(userDetails);

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void shouldInvalidateTokenWithDifferentUsername() {
        UserDetails userDetails = new User("testuser", "password", Collections.emptyList());
        UserDetails otherUser = new User("otheruser", "password", Collections.emptyList());
        String token = jwtService.generateToken(userDetails);

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    void shouldDetectExpiredToken() throws InterruptedException {
        // Setup with extremely short expiration
        SecurityProperties.Jwt shortJwtConfig = new SecurityProperties.Jwt(
                SECRET_KEY,
                Duration.ofMillis(1), // 1 ms expiration
                Duration.ofDays(7)
        );
        SecurityProperties shortSecurityProperties = new SecurityProperties(shortJwtConfig);
        JwtService shortJwtService = new JwtService(shortSecurityProperties);

        UserDetails userDetails = new User("testuser", "password", Collections.emptyList());
        String token = shortJwtService.generateToken(userDetails);

        // Sleep to ensure it's expired
        Thread.sleep(10);

        assertThrows(Exception.class, () -> shortJwtService.isTokenValid(token, userDetails));
    }
}
