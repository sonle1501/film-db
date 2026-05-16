package dev.sonle.filmdb.shared.event;

import java.util.UUID;

public record SetUserStateEvent(UUID userId, String state) {
}
