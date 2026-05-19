package dev.sonle.filmdb.users.dto;

import dev.sonle.filmdb.users.model.ItemState;
import dev.sonle.filmdb.users.model.UserListDetails;

import java.util.UUID;

public record ListItemDto(UUID itemId, UUID listId, String movieId, ItemState state, String notes) {
    public static ListItemDto from(UserListDetails userListDetails){
        return new ListItemDto(userListDetails.getItemId(), userListDetails.getListId(), userListDetails.getMovieId(), userListDetails.getState(), userListDetails.getNotes());
    }
}
