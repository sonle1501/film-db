package dev.sonle.filmdb.admin.controller;

import dev.sonle.filmdb.shared.internal.ImportPipelineInterface;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class ImportController {
    ImportPipelineInterface importPipeline;
    public ImportController(ImportPipelineInterface importPipelineInterface){
        this.importPipeline = importPipelineInterface;
    }

    @GetMapping("import-pipeline")
    public ResponseEntity<String> adminRunImport(){
        importPipeline.runImportPipeline();
        return ResponseEntity.ok("import all oke");
    }

    @GetMapping("/world")
    public ResponseEntity<String> run(){
        return ResponseEntity.ok("okee");
    }
}
