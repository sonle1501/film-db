export interface MovieBasicInfoDto {
  movieId: string;
  primaryTitle: string;
  originalTitle: string;
  isAdult: boolean;
  startYear: number;
  runtimeMinutes: number;
  genres: string[];
}

export interface PersonInfo {
  personId: string;
  primaryName: string;
  birthYear: number;
  deathYear: number;
  primaryProfession: string[];
  knownForTitles: string[];
}

export interface PersonDetailInfo {
  personId: string;
  primaryName: string;
  primaryProfession: string[];
  knownForTitles: MovieBasicInfoDto[];
}

export interface PersonInfoDto {
  id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
}

export interface LocalizedTitle {
  title: string;
  region: string;
  language: string;
}

export interface MoviePersonInfo {
  personId: string,
  primaryName: string,
  birthYear: number,
  deathYear: number,
  category: string,
  job: string,
  characters: string
}

export interface FullMovieInfo {
  movieId: string;
  primaryTitle: string;
  originalTitle: string;
  isAdult: boolean;
  startYear: number;
  runtimeMinutes: number;
  genres: string[];
  averageRating: number;
  numVotes: number;
  persons: MoviePersonInfo[];
}

export interface MovieSupplementaryInfo {
  movieId: string;
  localizedTitles: LocalizedTitle[];
}

export interface EpisodeInfoDto {
  episodeId: string;
  parentMovieId: string;
  seasonNumber: number;
  episodeNumber: number;
  primaryTitle: string;
  originalTitle: string;
  startYear: number;
  runtimeMinutes: number;
}

export interface MovieSearchResultDto {
  movieId: string;
  primaryTitle: string;
  originalTitle: string;
  titleType: string;
  startYear: number;
  genres: string[];
  averageRating: number;
  numVotes: number;
  relevanceScore: number;
}

export interface Page<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

