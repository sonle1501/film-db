package dev.sonle.filmdb.importer.api;

import dev.sonle.filmdb.importer.pipeline.ImportPipeline;
import dev.sonle.filmdb.shared.internal.ImportPipelineInterface;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
public class PipelineInternalEndpoint implements ImportPipelineInterface {
    ImportPipeline importPipeline;
    public PipelineInternalEndpoint(ImportPipeline importPipeline){
        this.importPipeline = importPipeline;
    }

    @Override
    public void runImportPipeline(){
        importPipeline.runPipeline();
    }

    public ResponseEntity<String> run(){
        return ResponseEntity.ok("okee");
    }
}
