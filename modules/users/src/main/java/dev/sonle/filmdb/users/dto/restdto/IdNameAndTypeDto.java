package dev.sonle.filmdb.users.dto.restdto;

import java.util.UUID;

public record IdNameAndTypeDto(UUID userId, String nameList, String type) {
}
