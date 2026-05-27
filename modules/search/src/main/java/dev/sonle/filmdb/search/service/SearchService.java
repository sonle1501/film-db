package dev.sonle.filmdb.search.service;

import dev.sonle.filmdb.search.dto.MovieSearchResultDto;
import dev.sonle.filmdb.search.repository.SearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final SearchRepository searchRepository;

    public Page<MovieSearchResultDto> searchSmart(String query, int page, int size) {
        int limit = Math.min(size, 50);
        int offset = page * limit;
        List<MovieSearchResultDto> results = searchRepository.searchSmart(query, limit, offset);
        return new PageImpl<>(results, PageRequest.of(page, limit), results.size() < limit ? offset + results.size() : offset + limit + 1);
    }

    public Page<MovieSearchResultDto> searchVietnamese(String query, int page, int size) {
        int limit = Math.min(size, 50);
        int offset = page * limit;
        List<MovieSearchResultDto> results = searchRepository.searchVietnamese(query, limit, offset);
        return new PageImpl<>(results, PageRequest.of(page, limit), results.size() < limit ? offset + results.size() : offset + limit + 1);
    }

    public List<MovieSearchResultDto> liveSearchSmart(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        return searchRepository.liveSearchSmart(query.trim(), Math.min(limit, 10));
    }

    public List<MovieSearchResultDto> liveSearchVietnamese(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        return searchRepository.liveSearchVietnamese(query.trim(), Math.min(limit, 10));
    }
}
