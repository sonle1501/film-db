package dev.sonle.filmdb.shared.event;

import java.util.UUID;

public record AdminApprovalEvent(UUID initiatorId) {
}
