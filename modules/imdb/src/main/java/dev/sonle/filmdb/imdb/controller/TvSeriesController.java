package dev.sonle.filmdb.imdb.controller;

import dev.sonle.filmdb.imdb.dto.EpisodeInfoDto;
import dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto;
import dev.sonle.filmdb.imdb.service.TvSeriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import dev.sonle.filmdb.shared.annotation.VersionedApi;
import java.util.List;

@RestController
@RequestMapping("/imdb/tvseries")
@VersionedApi
@RequiredArgsConstructor
public class TvSeriesController {

    private final TvSeriesService tvSeriesService;

    @GetMapping("/{film-id}/seasons")
    public ResponseEntity<Integer> getSeasons(@PathVariable("film-id") String filmId) {
        return ResponseEntity.ok(tvSeriesService.getNumberOfSeasons(filmId));
    }

    @GetMapping("/{film-id}/episodes")
    public ResponseEntity<List<EpisodeInfoDto>> getEpisodesBySeason(
            @PathVariable("film-id") String filmId,
            @RequestParam("season") Integer seasonNumber) {
        return ResponseEntity.ok(tvSeriesService.getEpisodesBySeason(filmId, seasonNumber));
    }

    @GetMapping("/{episode-id}")
    public ResponseEntity<EpisodeInfoDto> getEpisode(@PathVariable("episode-id") String episodeId) {
        EpisodeInfoDto episode = tvSeriesService.getEpisodeById(episodeId);
        return ResponseEntity.ok(episode);
    }

    @GetMapping("/{film-id}/by-name")
    public ResponseEntity<List<MovieBasicInfoDto>> getTvSeriesByName(
            @PathVariable(value = "film-id", required = false) String filmId,
            @RequestParam("name") String name) {
        return ResponseEntity.ok(tvSeriesService.getTvSeriesByName(name));
    }
}
