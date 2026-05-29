package dev.sonle.filmdb.shared.interfaces;

import java.util.UUID;

public interface ImdbDatasetPipelineInterface {
    void runPipeline(UUID jobId);
}
