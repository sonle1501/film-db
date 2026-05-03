package dev.sonle.filmdb.users.dto.restdto;

import java.util.UUID;

public record ItemMetadataForPatchUpdateDto(UUID itemId, String state, String notes) {
}
