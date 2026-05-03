package dev.sonle.filmdb.users.dto;

import dev.sonle.filmdb.users.model.ListType;
import dev.sonle.filmdb.users.model.UserList;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserListDto(
        UUID listId,
        UUID userId,
        String nameList,
        ListType listType,
        Boolean isCustom,
        Boolean isPublic,
        OffsetDateTime dateCreated) {

    public static UserListDto from(UserList userList){
        return new UserListDto(userList.getListId(),
                userList.getUserId(),
                userList.getNameList(),
                userList.getListType(),
                userList.getIsCustom(),
                userList.getIsPublic(),
                userList.getDateCreated());
    }

}
