package dev.sonle.filmdb.users.repository;

import dev.sonle.filmdb.users.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    Optional<UserProfile> getUserProfileByUsername(String username);
    Optional<UserProfile> getUserProfileByUserIdAndUsername(UUID userId, String username);
}
