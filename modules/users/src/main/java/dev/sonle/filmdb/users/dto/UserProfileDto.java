package dev.sonle.filmdb.users.dto;

import dev.sonle.filmdb.users.model.UserProfile;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserProfileDto(UUID userId, String displayName, String username, OffsetDateTime dateCreated, String bio) {
    public static UserProfileDto from(UserProfile u){
        return new UserProfileDto(u.getUserId(), u.getDisplayName(), u.getUsername(), u.getDateCreated(), u.getBio());
    }
}
