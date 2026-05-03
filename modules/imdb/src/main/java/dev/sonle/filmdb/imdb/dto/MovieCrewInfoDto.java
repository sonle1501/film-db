package dev.sonle.filmdb.imdb.dto;

import java.util.List;

public record MovieCrewInfoDto(
        String movieId,
        List<PersonBasicInfoDto> directors,
        List<PersonBasicInfoDto> writers
) {
}
