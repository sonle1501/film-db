package dev.sonle.filmdb.users.dto.restdto;

import java.util.UUID;

public record ItemMetadataForCreateDto(String movieId, String state, String notes) {
}
