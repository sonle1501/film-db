"use client";

import { useState } from "react";
import { Search, Flame, Trophy, Tv, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { MovieCard, MovieProps } from "@/components/features/movies/MovieCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { movieApi } from "@/lib/api-client";
import { AddToListModal } from "@/components/features/movies/AddToListModal";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const mockMovies: MovieProps[] = [
  { id: "1", title: "Dune: Part Two", year: 2024, rating: 8.8, imageUrl: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=400&q=80", genre: "Sci-Fi" },
  { id: "2", title: "Oppenheimer", year: 2023, rating: 8.6, imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80", genre: "Biography" },
  { id: "3", title: "Poor Things", year: 2023, rating: 8.4, imageUrl: "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&w=400&q=80", genre: "Comedy" },
  { id: "4", title: "Spider-Man: Across the Spider-Verse", year: 2023, rating: 8.7, imageUrl: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=400&q=80", genre: "Animation" },
  { id: "5", title: "The Dark Knight", year: 2008, rating: 9.0, imageUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=400&q=80", genre: "Action" },
  { id: "6", title: "Interstellar", year: 2014, rating: 8.6, imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=400&q=80", genre: "Sci-Fi" },
  { id: "7", title: "Parasite", year: 2019, rating: 8.5, imageUrl: "https://images.unsplash.com/photo-1455380579765-810023662ea2?auto=format&fit=crop&w=400&q=80", genre: "Thriller" },
  { id: "8", title: "Everything Everywhere All at Once", year: 2022, rating: 8.0, imageUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=400&q=80", genre: "Action" },
];

export default function MoviesPage() {
  const { user } = useAuthStore();
  const [searchType, setSearchType] = useState<"id" | "name">("id");
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<MovieProps[]>(mockMovies);
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
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const mapMovieData = (data: any[]): MovieProps[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: item.movieId,
      title: item.primaryTitle || "Unknown Title",
      year: item.startYear || new Date().getFullYear(),
      rating: item.averageRating || 0,
      imageUrl: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=400&q=80",
      genre: (item.genres && item.genres.length > 0) ? item.genres[0] : "Unknown",
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
      setMovies(mockMovies);
      setError(null);
      setActiveFilter(null);
      setIsFiltered(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setActiveFilter(null);
    setIsFiltered(false);

    try {
      if (searchType === "id") {
        const data = await movieApi.getMovieById(searchQuery.trim());
        const mappedMovie: MovieProps = {
          id: data.movieId, // Aligned with backend schema
          title: data.primaryTitle || "Unknown Title", 
          year: data.startYear || new Date().getFullYear(),
          rating: data.averageRating || 0, // Fallback if averageRating missing
          imageUrl: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=400&q=80",
          // Safely extract the first genre from the array
          genre: (data.genres && data.genres.length > 0) ? data.genres[0] : "Unknown", 
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
    setMovies(mockMovies);
    setTotalPages(0);
    setTotalElements(0);
    setCurrentPage(0);
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
          <div className="flex flex-col gap-6 mb-12">
            <h1 className="text-3xl font-bold text-white tracking-tight">Movies</h1>
            
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex w-full md:w-auto relative z-10">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as "id" | "name")}
                  className="appearance-none bg-surface-dark/80 border border-white/10 text-white rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 h-full"
                >
                  <option value="id">Search by ID</option>
                  <option value="name">Search by Name</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              
              <div className="relative flex-grow flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="block w-full pl-11 pr-24 py-3 border border-white/10 rounded-xl bg-surface-dark/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={searchType === "id" ? "Enter movie ID (e.g. tt0111161)" : "Enter movie name..."}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="absolute right-2 px-4 py-1.5 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Search
                </button>
              </div>
              
              <button 
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className={`flex items-center justify-center gap-2 px-6 py-3 border border-white/10 rounded-xl text-white transition-colors whitespace-nowrap ${
                  isFilterPanelOpen || isFiltered
                    ? "bg-primary-600 hover:bg-primary-500 border-primary-500 text-white"
                    : "bg-surface-dark/80 hover:bg-surface-dark"
                }`}
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span>Filter</span>
              </button>
            </div>

            {/* Filter Options Panel */}
            {isFilterPanelOpen && (
              <div className="bg-surface-dark/95 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl backdrop-blur-md transition-all duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Start Year */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Start Year</label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      placeholder="e.g. 2024"
                      value={filterStartYear}
                      onChange={(e) => setFilterStartYear(e.target.value)}
                      className="bg-surface-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                    />
                    <div className="relative">
                      <select
                        value={filterExactYear ? "exact" : "range"}
                        onChange={(e) => setFilterExactYear(e.target.value === "exact")}
                        className="appearance-none w-full bg-surface-dark/50 border border-white/10 rounded-xl px-3 py-2 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-xs h-[36px]"
                      >
                        <option value="range">From this year onwards</option>
                        <option value="exact">Exactly in this year</option>
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
                    <label className="text-sm font-semibold text-gray-300">Min Rating (and up)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      placeholder="e.g. 8.0"
                      value={filterMinRating}
                      onChange={(e) => setFilterMinRating(e.target.value)}
                      className="bg-surface-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                    />
                  </div>

                  {/* Min Votes */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Min Votes (and up)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 50000"
                      value={filterMinVotes}
                      onChange={(e) => setFilterMinVotes(e.target.value)}
                      className="bg-surface-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                    />
                  </div>

                  {/* Title Type */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Type</label>
                    <div className="relative">
                      <select
                        value={filterTitleType}
                        onChange={(e) => setFilterTitleType(e.target.value)}
                        className="appearance-none w-full bg-surface-dark/50 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm h-[46px]"
                      >
                        <option value="">All Types</option>
                        <option value="movie">Movie</option>
                        <option value="tvSeries">TV Series</option>
                        <option value="short">Short</option>
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
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("");
                      fetchFilteredMovies(0, "");
                    }}
                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}

            {/* Active Filter Tags */}
            {isFiltered && (
              <div className="flex flex-wrap items-center gap-2 bg-primary-950/20 border border-primary-500/20 rounded-xl p-3.5">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">Active filters:</span>
                {filterStartYear && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-600/15 border border-primary-500/30 text-primary-400 text-xs font-semibold rounded-full">
                    Year: {filterStartYear}{filterExactYear ? "" : "+"}
                  </span>
                )}
                {filterMinRating && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-600/15 border border-primary-500/30 text-primary-400 text-xs font-semibold rounded-full">
                    Rating: {filterMinRating}+
                  </span>
                )}
                {filterMinVotes && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-600/15 border border-primary-500/30 text-primary-400 text-xs font-semibold rounded-full">
                    Votes: {parseInt(filterMinVotes).toLocaleString()}+
                  </span>
                )}
                {filterTitleType && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-600/15 border border-primary-500/30 text-primary-400 text-xs font-semibold rounded-full">
                    Type: {filterTitleType === "movie" ? "Movie" : filterTitleType === "tvSeries" ? "TV Series" : "Short"}
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold underline underline-offset-2 ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={fetchPopularMovies}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'trending' 
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30 hover:bg-primary-600/30' 
                    : 'bg-surface-dark/50 text-gray-300 border border-white/10 hover:bg-surface-dark'
                }`}
              >
                <Flame className="h-4 w-4" />
                Trending
              </button>
              <button 
                onClick={fetchTopRatedMovies}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'top250' 
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30 hover:bg-primary-600/30' 
                    : 'bg-surface-dark/50 text-gray-300 border border-white/10 hover:bg-surface-dark'
                }`}
              >
                <Trophy className="h-4 w-4" />
                Top 250
              </button>
              <button 
                onClick={fetchTopRatedTvSeries}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'toptv' 
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30 hover:bg-primary-600/30' 
                    : 'bg-surface-dark/50 text-gray-300 border border-white/10 hover:bg-surface-dark'
                }`}
              >
                <Tv className="h-4 w-4" />
                Top TV Series
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
              <h2 className="text-xl font-semibold text-white">
                {searchQuery.trim() ? "Search Results" : 
                 isFiltered ? "Filtered Movies" :
                 activeFilter === 'trending' ? "Trending Now" :
                 activeFilter === 'top250' ? "Top 250 Movies" :
                 activeFilter === 'toptv' ? "Top TV Series" : "Trending Now"}
              </h2>
              <span className="text-sm text-gray-400">
                {isFiltered ? `Showing ${movies.length} of ${totalElements} results` : `Showing ${movies.length} results`}
              </span>
            </div>

            {/* Sorting Controls */}
            {isFiltered && (
              <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-dark/40 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">Sort by:</span>
                  <button
                    onClick={() => handleSort("averageRating")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      sortBy === "averageRating"
                        ? "bg-primary-600 border-primary-500 text-white"
                        : "bg-surface-dark/50 border-white/10 hover:bg-white/5 text-gray-300"
                    }`}
                  >
                    Average Rating
                  </button>
                  <button
                    onClick={() => handleSort("numVotes")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      sortBy === "numVotes"
                        ? "bg-primary-600 border-primary-500 text-white"
                        : "bg-surface-dark/50 border-white/10 hover:bg-white/5 text-gray-300"
                    }`}
                  >
                    Number of Votes
                  </button>
                </div>

                {sortBy && (
                  <button
                    onClick={handleSortDirection}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-dark/50 border border-white/10 hover:bg-white/5 text-gray-300 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    <span>Order: {sortDirection === "desc" ? "Descending" : "Ascending"}</span>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onContextMenu={handleContextMenu} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {isFiltered && totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6 mt-8">
                    <span className="text-sm text-gray-400">
                      Showing page {currentPage + 1} of {totalPages} ({totalElements} total results)
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => fetchFilteredMovies(currentPage - 1)}
                        disabled={currentPage === 0 || isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-surface-dark border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-surface-dark text-white text-sm font-semibold rounded-xl transition-all"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
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
                                <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-500 select-none text-sm font-semibold">
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
                                className={`min-w-[36px] h-9 flex items-center justify-center text-sm font-semibold rounded-xl border transition-all ${
                                  currentPage === pageNum
                                    ? "bg-primary-600 border-primary-500 text-white"
                                    : "bg-surface-dark border-white/10 hover:bg-white/5 text-gray-300"
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
                        className="flex items-center gap-1.5 px-4 py-2 bg-surface-dark border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-surface-dark text-white text-sm font-semibold rounded-xl transition-all"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
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
            className="absolute z-50 bg-surface-dark border border-white/10 rounded-lg shadow-xl py-2 min-w-[160px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
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
