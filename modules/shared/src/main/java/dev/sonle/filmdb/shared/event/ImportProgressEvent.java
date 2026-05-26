package dev.sonle.filmdb.shared.event;

import java.util.UUID;

public record ImportProgressEvent(
    UUID jobId,
    String stage,
    double progress,
    String message,
    boolean isFinished,
    boolean isFailed,
    String errorMessage
) {
    public static ImportProgressEvent progress(UUID jobId, String stage, double progress, String message) {
        return new ImportProgressEvent(jobId, stage, progress, message, false, false, null);
    }

    public static ImportProgressEvent finished(UUID jobId, String stage, String message) {
        return new ImportProgressEvent(jobId, stage, 100.0, message, true, false, null);
    }

    public static ImportProgressEvent failed(UUID jobId, String stage, String errorMessage) {
        return new ImportProgressEvent(jobId, stage, 0.0, null, false, true, errorMessage);
    }
}
