package dev.sonle.filmdb.users.controller.internal;

import dev.sonle.filmdb.shared.internal.UserListInterface;
import dev.sonle.filmdb.users.dto.UserListDto;
import dev.sonle.filmdb.users.dto.UserProfileDto;
import dev.sonle.filmdb.users.service.UserListService;
import dev.sonle.filmdb.users.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserListInternalController implements UserListInterface {

    private final UserListService userListService;
    private final UserProfileService userProfileService;

    @Override
    public List<UserListProjection> getUserLists(){
        List<UserListDto> userListDtos = userListService.getAllUserList();
        return userListDtos.stream()
                .map(dto -> new UserListProjection(
                        dto.listId(),
                        dto.userId(),
                        dto.nameList(),
                        dto.listType().toString(),
                        dto.isPublic(),
                        dto.isCustom(),
                        dto.dateCreated()))
                .toList();
    }

    @Override
    public List<UserListProjection> getUserLists(UUID userId){
        List<UserListDto> userListDtos = userListService.getAllUserLists(userId);
        return userListDtos.stream()
                .map(dto -> new UserListProjection(
                        dto.listId(),
                        dto.userId(),
                        dto.nameList(),
                        dto.listType().toString(),
                        dto.isPublic(),
                        dto.isCustom(),
                        dto.dateCreated()))
                .toList();
    }

    @Override
    public List<UserProfileProjection> getAllUserProfiles() {
        List<UserProfileDto> userProfileDtos = userProfileService.getAllUserProfiles();
        return userProfileDtos.stream()
                .map(dto -> new UserProfileProjection(
                        dto.userId(),
                        dto.displayName(),
                        dto.username(),
                        dto.dateCreated(),
                        dto.bio()))
                .toList();
    }
}
