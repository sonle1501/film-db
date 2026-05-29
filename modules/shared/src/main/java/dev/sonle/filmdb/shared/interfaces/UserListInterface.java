package dev.sonle.filmdb.shared.interfaces;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface UserListInterface {
    record UserListProjection(
            UUID listId,
            UUID userId,
            String nameList,
            String listType,
            Boolean isPublic,
            Boolean isCustom,
            OffsetDateTime dateCreated
    ) {}

    record UserInfoProjection(
            UUID userId,
            String displayName,
            String username,
            OffsetDateTime dateCreated,
            String bio,
            String role,
            String userState
    ) {}

    List<UserListProjection> getUserLists();
    List<UserListProjection> getUserLists(UUID userId);
    List<UserInfoProjection> getAllUserInfos();
    UserInfoProjection getUserInfo(UUID userId);
}
