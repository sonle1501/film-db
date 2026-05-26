package dev.sonle.filmdb.shared.internal;

import java.util.UUID;

public interface ImdbDatasetPipelineInterface {
    void runPipeline(UUID jobId);
}
