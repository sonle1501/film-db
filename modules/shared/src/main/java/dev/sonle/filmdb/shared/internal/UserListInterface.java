package dev.sonle.filmdb.shared.internal;

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

    record UserProfileProjection(
            UUID userId,
            String displayName,
            String username,
            OffsetDateTime dateCreated,
            String bio
    ) {}

    public List<UserListProjection> getUserLists();
    public List<UserListProjection> getUserLists(UUID userId);
    public List<UserProfileProjection> getAllUserProfiles();
}
