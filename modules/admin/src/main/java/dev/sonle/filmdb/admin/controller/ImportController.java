package dev.sonle.filmdb.admin.controller;

import dev.sonle.filmdb.shared.internal.ImdbDatasetPipelineInterface;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/admin")
public class ImportController {
    ImdbDatasetPipelineInterface pipeline;
    public ImportController(ImdbDatasetPipelineInterface imdbDatasetPipelineInterface){
        this.pipeline = imdbDatasetPipelineInterface;
    }

    @GetMapping("import-pipeline")
    public ResponseEntity<String> adminRunImport(){
        pipeline.runPipeline();
        return ResponseEntity.ok("IMDB pipeline has finished");
    }

    @GetMapping("/world")
    public ResponseEntity<String> run(){
        return ResponseEntity.ok("okee");
    }
}
