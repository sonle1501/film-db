package dev.sonle.filmdb.search.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
public class Hello {
    @GetMapping()
    public ResponseEntity<String> getSearchResult(@RequestParam("name") String movieName){
        return ResponseEntity.ok(movieName);
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> getHello(@RequestParam("rid") String r, @PathVariable("id") String i){
        System.out.println(r);
        System.out.println(i);
        return ResponseEntity.ok("helo");
    }

}
