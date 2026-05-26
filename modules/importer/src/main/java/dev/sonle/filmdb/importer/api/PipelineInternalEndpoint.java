package dev.sonle.filmdb.importer.api;

import dev.sonle.filmdb.importer.pipeline.ImdbDatasetPipeline;
import dev.sonle.filmdb.shared.internal.ImdbDatasetPipelineInterface;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class PipelineInternalEndpoint implements ImdbDatasetPipelineInterface {

    ImdbDatasetPipeline imdbDatasetPipeline;

    public PipelineInternalEndpoint(ImdbDatasetPipeline imdbDatasetPipeline){
        this.imdbDatasetPipeline = imdbDatasetPipeline;
    }

    @Override
    public void runPipeline(UUID jobId){
        imdbDatasetPipeline.runPipeline(jobId);
    }

    public ResponseEntity<String> run(){
        return ResponseEntity.ok("okee");
    }
}
