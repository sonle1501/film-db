"use client";

import { useState } from "react";
import { Search, Flame, Trophy, Tv, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { MovieCard, MovieProps } from "@/components/features/movies/MovieCard";
import { getMoviePosterUrl } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { movieApi } from "@/lib/api-client";
import { AddToListModal } from "@/components/features/movies/AddToListModal";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function MoviesPage() {
  const { user } = useAuthStore();
  const [searchType, setSearchType] = useState<"id" | "name">("id");
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<MovieProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"trending" | "top250" | "toptv" | null>(null);

  // Filter States
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filterStartYear, setFilterStartYear] = useState<string>("");
  const [filterMinRating, setFilterMinRating] = useState<string>("");
  const [filterMinVotes, setFilterMinVotes] = useState<string>("1000");
  const [filterTitleType, setFilterTitleType] = useState<string>("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterExactYear, setFilterExactYear] = useState(false);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; movieId: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string>("");

  const handleContextMenu = (e: React.MouseEvent, movieId: string) => {
    if (!user) return;
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, movieId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    window.addEventListener("click", handleClick);
    fetchPopularMovies();
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const mapMovieData = (data: any[]): MovieProps[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: item.movieId,
      title: item.primaryTitle || "Unknown Title",
      year: item.startYear || new Date().getFullYear(),
      rating: item.averageRating || 0,
      imageUrl: getMoviePosterUrl(item.imageUrl),
      genre: (item.genres && item.genres.length > 0) ? item.genres[0] : "Unknown",
      votes: item.numVotes,
    }));
  };

  const fetchTopRatedMovies = async () => {
    setIsLoading(true);
    setError(null);
    setActiveFilter("top250");
    setSearchQuery("");
    setIsFiltered(false);
    try {
      const data = await movieApi.getTopRatedMovies();
      setMovies(mapMovieData(data));
    } catch (err: any) {
      setError(err.data?.message || err.message || "Failed to fetch top 250 movies");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopRatedTvSeries = async () => {
    setIsLoading(true);
    setError(null);
    setActiveFilter("toptv");
    setSearchQuery("");
    setIsFiltered(false);
    try {
      const data = await movieApi.getTopRatedTvSeries();
      setMovies(mapMovieData(data));
    } catch (err: any) {
      setError(err.data?.message || err.message || "Failed to fetch top TV series");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPopularMovies = async () => {
    setIsLoading(true);
    setError(null);
    setActiveFilter("trending");
    setSearchQuery("");
    setIsFiltered(false);
    try {
      const data = await movieApi.getPopularMovies();
      setMovies(mapMovieData(data));
    } catch (err: any) {
      setError(err.data?.message || err.message || "Failed to fetch popular movies");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPopularMovies();
      return;
    }

    setIsLoading(true);
    setError(null);
    setActiveFilter(null);
    setIsFiltered(false);

    try {
      if (searchType === "id") {
        const data = await movieApi.getMovieFullById(searchQuery.trim());
        const mappedMovie: MovieProps = {
          id: data.movieId, // Aligned with backend schema
          title: data.primaryTitle || "Unknown Title", 
          year: data.startYear || new Date().getFullYear(),
          rating: data.averageRating || 0, // Fallback if averageRating missing
          imageUrl: getMoviePosterUrl(data.imageUrl),
          // Safely extract the first genre from the array
          genre: (data.genres && data.genres.length > 0) ? data.genres[0] : "Unknown", 
          votes: data.numVotes,
        };
        setMovies([mappedMovie]);
      } else {
        const data = await movieApi.getMoviesByName(searchQuery.trim());
        setMovies(mapMovieData(Array.isArray(data) ? data : []));
      }
    } catch (err: any) {
      if (err.status === 404 && searchType === "id") {
        setError("Movie not found");
      } else {
        setError(err.data?.message || err.message || "An error occurred during search");
      }
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredMovies = async (pageToFetch: number, currentSortBy = sortBy, currentSortDir = sortDirection) => {
    setIsLoading(true);
    setError(null);
    setActiveFilter(null);
    setSearchQuery("");

    const startYear = filterStartYear ? parseInt(filterStartYear) : null;
    const averageRating = filterMinRating ? parseFloat(filterMinRating) : null;
    const numVotes = filterMinVotes ? parseInt(filterMinVotes) : null;
    const titleType = filterTitleType || null;

    try {
      let data;
      if (currentSortBy) {
        const payload = { startYear, averageRating, numVotes, titleType, sortBy: currentSortBy, sortDirection: currentSortDir };
        data = filterExactYear
          ? await movieApi.filterAndSortMoviesExactYear(payload, pageToFetch, 10)
          : await movieApi.filterAndSortMovies(payload, pageToFetch, 10);
      } else {
        const payload = { startYear, averageRating, numVotes, titleType };
        data = filterExactYear
          ? await movieApi.filterMoviesExactYear(payload, pageToFetch, 10)
          : await movieApi.filterMovies(payload, pageToFetch, 10);
      }
      setMovies(mapMovieData(data.content || []));
      setCurrentPage(data.number || 0);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setIsFiltered(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch filtered movies");
      setMovies([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilterStartYear("");
    setFilterMinRating("");
    setFilterMinVotes("1000");
    setFilterTitleType("");
    setFilterExactYear(false);
    setSortBy("");
    setSortDirection("desc");
    setIsFiltered(false);
    setTotalPages(0);
    setTotalElements(0);
    setCurrentPage(0);
    fetchPopularMovies();
  };

  const handleSort = (field: string) => {
    const nextSort = sortBy === field ? "" : field;
    setSortBy(nextSort);
    fetchFilteredMovies(0, nextSort, sortDirection);
  };

  const handleSortDirection = () => {
    const nextDir = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(nextDir);
    fetchFilteredMovies(0, sortBy, nextDir);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar showSearch={false} />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header and Search */}
          <div className="flex flex-col gap-6 mb-12 p-6 md:p-8 bg-surface-elevated-dark/30 border border-white/10 relative overflow-hidden">
            {/* Cyberpunk corner decorations */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-accent"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-accent"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-accent"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-accent"></div>

            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mt-2">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold font-display uppercase tracking-widest text-white flex items-center gap-1">
                  // MOVIES
                </h1>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
              <div className="flex w-full md:w-auto relative z-10 terminal-border">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as "id" | "name")}
                  className="appearance-none bg-surface-dark/90 text-white rounded-none font-mono text-sm px-5 py-4 pr-12 focus:outline-none w-full md:w-[220px] cursor-pointer border-none"
                >
                  <option value="id">SEARCH BY ID</option>
                  <option value="name">SEARCH BY NAME</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-accent">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>

              <div className="relative flex-grow flex items-center terminal-border">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-cyan-accent/80" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="block w-full pl-12 pr-32 py-4 bg-surface-dark/60 text-white font-mono text-sm uppercase placeholder-gray-600 focus:outline-none border-none"
                  placeholder={searchType === "id" ? "> ENTER ID (E.G. TT0111161)" : "> ENTER TITLE..."}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="absolute right-3 px-5 py-2 bg-cyan-accent/10 border border-cyan-accent/40 text-cyan-accent hover:bg-cyan-accent hover:text-black hover:border-cyan-accent disabled:opacity-50 text-xs font-mono font-bold uppercase rounded-none transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  [ SEARCH ]
                </button>
              </div>

              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className={`flex items-center justify-center gap-2 px-8 py-4 border transition-all whitespace-nowrap text-xs font-mono font-bold uppercase rounded-none cursor-pointer ${
                  isFilterPanelOpen || isFiltered
                    ? "bg-cyan-accent/20 border-cyan-accent text-cyan-accent shadow-[0_0_8px_rgba(85,234,212,0.4)]"
                    : "bg-surface-dark/90 border-white/10 text-white/80 hover:border-cyan-accent/50 hover:text-cyan-accent hover:shadow-[0_0_8px_rgba(85,234,212,0.15)]"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>[ FILTER ]</span>
              </button>
            </div>

            {/* Filter Options Panel */}
            {isFilterPanelOpen && (
              <div className="bg-surface-dark border border-white/10 rounded-none p-6 flex flex-col gap-6 shadow-2xl backdrop-blur-md transition-all duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Start Year */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono uppercase text-text-muted-dark">Start Year</label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      placeholder="E.G. 2024"
                      value={filterStartYear}
                      onChange={(e) => setFilterStartYear(e.target.value)}
                      className="bg-surface-dark/50 border border-white/10 rounded-none px-4 py-2.5 text-white font-mono text-xs uppercase placeholder-gray-600 focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent/30 transition-all"
                    />
                    <div className="relative">
                      <select
                        value={filterExactYear ? "exact" : "range"}
                        onChange={(e) => setFilterExactYear(e.target.value === "exact")}
                        className="appearance-none w-full bg-surface-dark/50 border border-white/10 rounded-none px-3 py-2 pr-8 text-white font-mono text-xs uppercase focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent/30 transition-all h-[36px]"
                      >
                        <option value="range">FROM THIS YEAR ONWARDS</option>
                        <option value="exact">EXACTLY IN THIS YEAR</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                        <svg className="fill-current h-3.5 w-3.5 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Min Rating */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono uppercase text-text-muted-dark">Min Rating (and up)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      placeholder="E.G. 8.0"
                      value={filterMinRating}
                      onChange={(e) => setFilterMinRating(e.target.value)}
                      className="bg-surface-dark/50 border border-white/10 rounded-none px-4 py-2.5 text-white font-mono text-xs uppercase placeholder-gray-600 focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent/30 transition-all"
                    />
                  </div>

                  {/* Min Votes */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono uppercase text-text-muted-dark">Min Votes (and up)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="E.G. 50000"
                      value={filterMinVotes}
                      onChange={(e) => setFilterMinVotes(e.target.value)}
                      className="bg-surface-dark/50 border border-white/10 rounded-none px-4 py-2.5 text-white font-mono text-xs uppercase placeholder-gray-600 focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent/30 transition-all"
                    />
                  </div>

                  {/* Title Type */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono uppercase text-text-muted-dark">Type</label>
                    <div className="relative">
                      <select
                        value={filterTitleType}
                        onChange={(e) => setFilterTitleType(e.target.value)}
                        className="appearance-none w-full bg-surface-dark/50 border border-white/10 rounded-none px-4 py-2.5 pr-10 text-white font-mono text-xs uppercase focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent/30 transition-all h-[40px]"
                      >
                        <option value="">ALL TYPES</option>
                        <option value="movie">MOVIE</option>
                        <option value="tvSeries">TV SERIES</option>
                        <option value="short">SHORT</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
                        <svg className="fill-current h-4 w-4 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-none text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                  >
                    [ CLEAR FILTERS ]
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("");
                      fetchFilteredMovies(0, "");
                    }}
                    className="px-5 py-2 bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent hover:bg-cyan-accent hover:text-black hover:border-cyan-accent rounded-none text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                  >
                    [ APPLY FILTER ]
                  </button>
                </div>
              </div>
            )}

            {/* Active Filter Tags */}
            {isFiltered && (
              <div className="flex flex-wrap items-center gap-2 bg-cyan-accent/5 border border-cyan-accent/20 rounded-none p-3.5">
                <span className="text-xs text-text-muted-dark font-mono uppercase tracking-wider mr-1">Active filters:</span>
                {filterStartYear && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent text-xs font-mono font-bold uppercase rounded-none">
                    YEAR: {filterStartYear}{filterExactYear ? "" : "+"}
                  </span>
                )}
                {filterMinRating && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent text-xs font-mono font-bold uppercase rounded-none">
                    RATING: {filterMinRating}+
                  </span>
                )}
                {filterMinVotes && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent text-xs font-mono font-bold uppercase rounded-none">
                    VOTES: {parseInt(filterMinVotes).toLocaleString()}+
                  </span>
                )}
                {filterTitleType && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent text-xs font-mono font-bold uppercase rounded-none">
                    TYPE: {filterTitleType === "movie" ? "MOVIE" : filterTitleType === "tvSeries" ? "TV SERIES" : "SHORT"}
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-red-accent hover:text-red-accent/80 font-mono uppercase font-bold ml-auto cursor-pointer"
                >
                  [ CLEAR ALL ]
                </button>
              </div>
            )}

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={fetchPopularMovies}
                className={`flex items-center gap-2 px-4 py-2 rounded-none text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                  activeFilter === 'trending' 
                    ? 'bg-cyan-accent/20 text-cyan-accent border-cyan-accent shadow-[0_0_8px_rgba(85,234,212,0.2)]' 
                    : 'bg-surface-dark/50 text-text-muted-dark border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                [ TRENDING ]
              </button>
              <button 
                onClick={fetchTopRatedMovies}
                className={`flex items-center gap-2 px-4 py-2 rounded-none text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                  activeFilter === 'top250' 
                    ? 'bg-cyan-accent/20 text-cyan-accent border-cyan-accent shadow-[0_0_8px_rgba(85,234,212,0.2)]' 
                    : 'bg-surface-dark/50 text-text-muted-dark border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />
                [ TOP 250 ]
              </button>
              <button 
                onClick={fetchTopRatedTvSeries}
                className={`flex items-center gap-2 px-4 py-2 rounded-none text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                  activeFilter === 'toptv' 
                    ? 'bg-cyan-accent/20 text-cyan-accent border-cyan-accent shadow-[0_0_8px_rgba(85,234,212,0.2)]' 
                    : 'bg-surface-dark/50 text-text-muted-dark border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <Tv className="h-3.5 w-3.5" />
                [ TOP TV SERIES ]
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
              {error}
            </div>
          )}

          {/* Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-display uppercase tracking-wider text-white">
                {searchQuery.trim() ? "Search Results" : 
                 isFiltered ? "Filtered Movies" :
                 activeFilter === 'trending' ? "Trending Now" :
                 activeFilter === 'top250' ? "Top 250 Movies" :
                 activeFilter === 'toptv' ? "Top TV Series" : "Trending Now"}
              </h2>
              <span className="text-xs font-mono uppercase text-text-muted-dark font-bold">
                {isFiltered ? `Showing ${movies.length} of ${totalElements} results` : `Showing ${movies.length} results`}
              </span>
            </div>

            {/* Sorting Controls */}
            {isFiltered && (
              <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-dark border border-white/10 rounded-none p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono uppercase text-text-muted-dark">Sort by:</span>
                  <button
                    onClick={() => handleSort("averageRating")}
                    className={`px-4 py-2 rounded-none text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                      sortBy === "averageRating"
                        ? "bg-cyan-accent/20 border-cyan-accent text-cyan-accent shadow-[0_0_8px_rgba(85,234,212,0.2)]"
                        : "bg-surface-dark/50 border-white/10 hover:border-white/20 text-text-muted-dark hover:text-white"
                    }`}
                  >
                    Average Rating
                  </button>
                  <button
                    onClick={() => handleSort("numVotes")}
                    className={`px-4 py-2 rounded-none text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                      sortBy === "numVotes"
                        ? "bg-cyan-accent/20 border-cyan-accent text-cyan-accent shadow-[0_0_8px_rgba(85,234,212,0.2)]"
                        : "bg-surface-dark/50 border-white/10 hover:border-white/20 text-text-muted-dark hover:text-white"
                    }`}
                  >
                    Number of Votes
                  </button>
                </div>

                {sortBy && (
                  <button
                    onClick={handleSortDirection}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-dark/50 border border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-none text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5 text-cyan-accent" />
                    <span>Order: {sortDirection === "desc" ? "[ DESC ]" : "[ ASC ]"}</span>
                  </button>
                )}
              </div>
            )}
            
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              </div>
            ) : movies.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onContextMenu={handleContextMenu} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {isFiltered && totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6 mt-8">
                    <span className="text-xs font-mono uppercase text-text-muted-dark font-bold">
                      Showing page {currentPage + 1} of {totalPages} ({totalElements} total results)
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => fetchFilteredMovies(currentPage - 1)}
                        disabled={currentPage === 0 || isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-surface-dark border border-white/10 hover:border-white/20 disabled:opacity-30 disabled:hover:bg-surface-dark text-white text-xs font-mono font-bold uppercase rounded-none transition-all cursor-pointer"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 text-cyan-accent" />
                        PREVIOUS
                      </button>

                      <div className="flex items-center gap-1">
                        {(() => {
                          const pages: (number | string)[] = [];
                          const delta = 1; // Number of pages to show around current page
                          
                          for (let i = 0; i < totalPages; i++) {
                            if (
                              i === 0 ||
                              i === totalPages - 1 ||
                              (i >= currentPage - delta && i <= currentPage + delta)
                            ) {
                              pages.push(i);
                            } else if (
                              (i === 1 && currentPage - delta > 1) ||
                              (i === totalPages - 2 && currentPage + delta < totalPages - 2)
                            ) {
                              pages.push("...");
                            }
                          }
                          
                          const uniquePages: (number | string)[] = [];
                          pages.forEach((p, idx) => {
                            if (p !== "..." || pages[idx - 1] !== "...") {
                              uniquePages.push(p);
                            }
                          });
                          
                          return uniquePages.map((pageVal, idx) => {
                            if (pageVal === "...") {
                              return (
                                <span key={`ellipsis-${idx}`} className="px-2 py-2 text-text-muted-dark select-none text-xs font-mono font-bold">
                                  ...
                                </span>
                              );
                            }
                            const pageNum = pageVal as number;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => fetchFilteredMovies(pageNum)}
                                disabled={isLoading}
                                className={`min-w-[36px] h-9 flex items-center justify-center text-xs font-mono font-bold rounded-none border transition-all cursor-pointer ${
                                  currentPage === pageNum
                                    ? "bg-cyan-accent/20 border-cyan-accent text-cyan-accent shadow-[0_0_8px_rgba(85,234,212,0.2)]"
                                    : "bg-surface-dark border-white/10 hover:border-white/20 text-text-muted-dark hover:text-white"
                                }`}
                              >
                                {pageNum + 1}
                              </button>
                            );
                          });
                        })()}
                      </div>

                      <button
                        onClick={() => fetchFilteredMovies(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1 || isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-surface-dark border border-white/10 hover:border-white/20 disabled:opacity-30 disabled:hover:bg-surface-dark text-white text-xs font-mono font-bold uppercase rounded-none transition-all cursor-pointer"
                      >
                        NEXT
                        <ChevronRight className="h-3.5 w-3.5 text-cyan-accent" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p>No movies found for your search.</p>
              </div>
            )}
          </div>
        </div>

        {contextMenu && (
          <div
            className="absolute z-50 bg-surface-elevated-dark border border-white/10 rounded-none shadow-2xl py-1.5 min-w-[160px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="w-full text-left px-4 py-2 text-xs font-mono uppercase text-text-muted-dark hover:bg-cyan-accent/10 hover:text-cyan-accent transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMovieId(contextMenu.movieId);
                setIsModalOpen(true);
                closeContextMenu();
              }}
            >
              Add to List
            </button>
          </div>
        )}

        {isModalOpen && selectedMovieId && (
          <AddToListModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            movieId={selectedMovieId}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
