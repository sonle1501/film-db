package dev.sonle.filmdb.imdb.service;

import dev.sonle.filmdb.imdb.dto.EpisodeInfoDto;
import dev.sonle.filmdb.imdb.dto.MovieBasicInfoDto;
import dev.sonle.filmdb.imdb.repository.MovieEpisodeRepository;
import dev.sonle.filmdb.imdb.repository.MovieRepository;
import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TvSeriesService {
    
    private final MovieEpisodeRepository movieEpisodeRepository;
    private final MovieRepository movieRepository;

    public Integer getNumberOfSeasons(String filmId) {
        Integer seasons = movieEpisodeRepository.getNumberOfSeasons(filmId);
        return seasons != null ? seasons : 0;
    }

    public List<EpisodeInfoDto> getEpisodesBySeason(String filmId, Integer seasonNumber) {
        return movieEpisodeRepository.findEpisodesBySeason(filmId, seasonNumber);
    }

    public EpisodeInfoDto getEpisodeById(String episodeId) {
        return movieEpisodeRepository.findEpisodeById(episodeId)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.MOVIE_NOT_FOUND, String.format("Cannot found episode with id %s", episodeId)));
    }

    public List<MovieBasicInfoDto> getTvSeriesByName(String name) {
        return movieRepository.findTvSeriesByName(name);
    }
}
