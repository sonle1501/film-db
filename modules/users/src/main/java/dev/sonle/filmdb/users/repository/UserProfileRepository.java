package dev.sonle.filmdb.users.repository;

import dev.sonle.filmdb.users.model.UserProfile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    @EntityGraph(attributePaths = {"userAuth"})
    Optional<UserProfile> getUserProfileByUsername(String username);
    
    @EntityGraph(attributePaths = {"userAuth"})
    Optional<UserProfile> getUserProfileByUserIdAndUsername(UUID userId, String username);
    
    @EntityGraph(attributePaths = {"userAuth"})
    Optional<UserProfile> getUserProfileByUserId(UUID userId);

    @NonNull
    @EntityGraph(attributePaths = {"userAuth"})
    List<UserProfile> findAll();
}
