package dev.sonle.filmdb.shared.event;

import java.util.UUID;

public record ImdbDataImportedEvent(UUID jobId) {}
