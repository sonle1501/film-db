package dev.sonle.filmdb.users.repository;

import dev.sonle.filmdb.users.model.RefreshToken;
import dev.sonle.filmdb.users.model.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserAuth(UserAuth userAuth);
}
