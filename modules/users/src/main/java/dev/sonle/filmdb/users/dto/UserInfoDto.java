package dev.sonle.filmdb.users.dto;

import dev.sonle.filmdb.users.model.UserProfile;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserInfoDto(UUID userId, String displayName, String username, OffsetDateTime dateCreated, String bio, String role, String userState) {
    public static UserInfoDto from(UserProfile u){
        return new UserInfoDto(
                u.getUserId(), 
                u.getDisplayName(), 
                u.getUsername(), 
                u.getDateCreated(), 
                u.getBio(),
                u.getUserAuth() != null && u.getUserAuth().getRole() != null ? u.getUserAuth().getRole().name() : null,
                u.getUserAuth() != null && u.getUserAuth().getUserState() != null ? u.getUserAuth().getUserState().name() : null
        );
    }
}
