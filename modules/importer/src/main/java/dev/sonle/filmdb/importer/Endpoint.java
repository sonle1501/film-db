package dev.sonle.filmdb.importer;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/import")
public class Endpoint {
    private StartImporterService importerService;
    public Endpoint(StartImporterService importerService){
        this.importerService = importerService;
    }


    @GetMapping("/hello")
    public ResponseEntity<String> runImporter(){
        return ResponseEntity.ok("import service oke");
    }

    @GetMapping("/runall")
    public ResponseEntity<String> runAll(){
        importerService.execute();
        return ResponseEntity.ok("import service oke");
    }
}
