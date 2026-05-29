package dev.sonle.filmdb.search.controller;

import dev.sonle.filmdb.search.dto.MovieSearchResultDto;
import dev.sonle.filmdb.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import dev.sonle.filmdb.shared.annotation.VersionedApi;
import java.util.List;

@RestController
@RequestMapping("/search")
@VersionedApi
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    // Normal Smart Search Endpoint
    @GetMapping
    public ResponseEntity<Page<MovieSearchResultDto>> searchSmart(
            @RequestParam("query") String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(searchService.searchSmart(query, page, size));
    }

    // Normal Smart Live Search Endpoint
    @GetMapping("/live")
    public ResponseEntity<List<MovieSearchResultDto>> liveSearchSmart(
            @RequestParam("query") String query,
            @RequestParam(value = "limit", defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(searchService.liveSearchSmart(query, limit));
    }

    // Vietnamese Localized Search Endpoint
    @GetMapping("/vn")
    public ResponseEntity<Page<MovieSearchResultDto>> searchVietnamese(
            @RequestParam("query") String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(searchService.searchVietnamese(query, page, size));
    }

    // Vietnamese Localized Live Search Endpoint
    @GetMapping("/vn/live")
    public ResponseEntity<List<MovieSearchResultDto>> liveSearchVietnamese(
            @RequestParam("query") String query,
            @RequestParam(value = "limit", defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(searchService.liveSearchVietnamese(query, limit));
    }
}
