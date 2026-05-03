package dev.sonle.filmdb.users.dto.restdto;

public record ChangeUsernameRequestDto(String username, String password, String newUsername) {
}
