package dev.sonle.filmdb.users.dto.restdto;

import dev.sonle.filmdb.users.model.ListType;

import java.io.Serializable;
import java.util.UUID;

public record ListMetadataForPatchUpdateDto(UUID userId, UUID listId, String nameList, Boolean isPublic, Boolean isCustom, ListType listType) implements Serializable {

}
