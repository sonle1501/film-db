"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight, ArrowUpDown, Tag, Film } from "lucide-react";
import { MovieCard, MovieProps } from "@/components/features/movies/MovieCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { movieApi } from "@/lib/api-client";
import { AddToListModal } from "@/components/features/movies/AddToListModal";
import { useAuthStore } from "@/store/useAuthStore";

export default function GenresPage() {
  const { user } = useAuthStore();
  const [genres, setGenres] = useState<string[]>([]);
  const [activeGenre, setActiveGenre] = useState<string>("");
  const [movies, setMovies] = useState<MovieProps[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      rating: item.averageRating || item.rating || 0,
      imageUrl: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=400&q=80",
      genre: (item.genres && item.genres.length > 0) ? item.genres[0] : "Unknown",
    }));
  };

  // 1. Fetch distinct genres list on load
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsLoadingGenres(true);
        const data = await movieApi.getGenres();
        setGenres(data);
      } catch (err: any) {
        setError(err.data?.message || err.message || "Failed to load genres.");
      } finally {
        setIsLoadingGenres(false);
      }
    };
    fetchGenres();
  }, []);

  // 2. Fetch movies when selected genre or filters change
  useEffect(() => {
    if (!activeGenre) return;
    fetchMovies(0, sortBy, sortDirection);
  }, [activeGenre]);

  const fetchMovies = async (pageToFetch: number, currentSortBy = sortBy, currentSortDir = sortDirection) => {
    setIsLoadingMovies(true);
    setError(null);

    // If filter criteria are filled, use the filter flow
    const startYear = filterStartYear ? parseInt(filterStartYear) : null;
    const averageRating = filterMinRating ? parseFloat(filterMinRating) : null;
    const numVotes = filterMinVotes ? parseInt(filterMinVotes) : null;
    const titleType = filterTitleType || null;

    const hasFilters = startYear !== null || averageRating !== null || numVotes !== 1000 || titleType !== null;

    try {
      if (hasFilters || currentSortBy) {
        setIsFiltered(true);
        let data;
        if (currentSortBy) {
          const payload = { 
            startYear, 
            averageRating, 
            numVotes, 
            titleType, 
            genre: activeGenre,
            sortBy: currentSortBy, 
            sortDirection: currentSortDir 
          };
          data = filterExactYear
            ? await movieApi.filterAndSortMoviesExactYear(payload, pageToFetch, 10)
            : await movieApi.filterAndSortMovies(payload, pageToFetch, 10);
        } else {
          const payload = { startYear, averageRating, numVotes, titleType, genre: activeGenre };
          data = filterExactYear
            ? await movieApi.filterMoviesExactYear(payload, pageToFetch, 10)
            : await movieApi.filterMovies(payload, pageToFetch, 10);
        }
        setMovies(mapMovieData(data.content || []));
        setCurrentPage(data.number || 0);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        setIsFiltered(false);
        // Default paginated fetch for the specific genre (max 20 per page)
        const data = await movieApi.getMoviesByGenre(activeGenre, pageToFetch, 20);
        setMovies(mapMovieData(data.content || []));
        setCurrentPage(data.number || 0);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch movies.");
      setMovies([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoadingMovies(false);
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
    
    // Trigger fresh reload of the active genre with default options
    if (activeGenre) {
      setIsLoadingMovies(true);
      movieApi.getMoviesByGenre(activeGenre, 0, 20)
        .then((data) => {
          setMovies(mapMovieData(data.content || []));
          setCurrentPage(data.number || 0);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
          setError(null);
        })
        .catch((err: any) => {
          setError(err.response?.data?.message || err.message || "Failed to fetch movies.");
          setMovies([]);
        })
        .finally(() => {
          setIsLoadingMovies(false);
        });
    }
  };

  const handleSort = (field: string) => {
    const nextSort = sortBy === field ? "" : field;
    setSortBy(nextSort);
    fetchMovies(0, nextSort, sortDirection);
  };

  const handleSortDirection = () => {
    const nextDir = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(nextDir);
    fetchMovies(0, sortBy, nextDir);
  };

  const hasActiveFilters = !!(
    filterStartYear ||
    filterMinRating ||
    (filterMinVotes && filterMinVotes !== "1000") ||
    filterTitleType
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar showSearch={true} />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-2.5">
              <Tag className="h-7 w-7 text-primary-500" />
              Explore by Genre
            </h1>
            <p className="text-text-muted-dark text-sm max-w-xl">
              Browse and filter titles matching your preferred style, category, or vibe.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
              {error}
            </div>
          )}

          {isLoadingGenres ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-4 lg:gap-8 items-start">
              {/* Left Column: Genres selection */}
              <div className="mb-8 lg:mb-0 bg-surface-dark border border-white/10 rounded-2xl p-4 sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto">
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4 px-2">Genres List</h3>
                
                {/* Swipeable container on mobile, simple list on desktop */}
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => {
                        setActiveGenre(genre);
                        // Reset pagination states
                        setCurrentPage(0);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        activeGenre === genre
                          ? "bg-primary-600/25 border border-primary-500 text-white font-semibold"
                          : "bg-white/5 border border-transparent text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{genre}</span>
                      {activeGenre === genre && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-400 hidden lg:block" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Columns: Movies listing */}
              <div className="lg:col-span-3 space-y-6">
                {activeGenre ? (
                  <>
                    {/* Filter and Top Action Bar */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-4 bg-surface-dark border border-white/10 rounded-2xl p-4">
                        <div>
                          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Film className="h-5 w-5 text-gray-400" />
                            {activeGenre}
                          </h2>
                          <p className="text-xs text-text-muted-dark">
                            {sortBy 
                              ? `Showing ${movies.length} of ${totalElements} sorted results` 
                              : isFiltered 
                                ? `Showing ${movies.length} of ${totalElements} filtered results` 
                                : `Showing ${movies.length} of ${totalElements} titles`}
                          </p>
                        </div>

                        <button 
                          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                          className={`flex items-center justify-center gap-2 px-5 py-2.5 border border-white/10 rounded-xl text-white transition-colors whitespace-nowrap text-sm font-medium ${
                            isFilterPanelOpen || isFiltered
                              ? "bg-primary-600 hover:bg-primary-500 border-primary-500 text-white"
                              : "bg-surface-dark hover:bg-white/5"
                          }`}
                        >
                          <SlidersHorizontal className="h-4 w-4" />
                          <span>Filters</span>
                        </button>
                      </div>

                      {/* Dynamic Filter Panel */}
                      {isFilterPanelOpen && (
                        <div className="bg-surface-elevated-dark/95 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl backdrop-blur-md transition-all duration-300">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {/* Start Year */}
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-semibold text-gray-300">Start Year</label>
                              <input
                                type="number"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                placeholder="e.g. 2024"
                                value={filterStartYear}
                                onChange={(e) => setFilterStartYear(e.target.value)}
                                className="bg-surface-dark/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                              />
                              <div className="relative">
                                <select
                                  value={filterExactYear ? "exact" : "range"}
                                  onChange={(e) => setFilterExactYear(e.target.value === "exact")}
                                  className="appearance-none w-full bg-surface-dark/50 border border-white/10 rounded-xl px-3 py-1.5 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-xs h-[32px]"
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
                              <label className="text-xs font-semibold text-gray-300">Min Rating (and up)</label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                placeholder="e.g. 8.0"
                                value={filterMinRating}
                                onChange={(e) => setFilterMinRating(e.target.value)}
                                className="bg-surface-dark/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                              />
                            </div>

                            {/* Min Votes */}
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-semibold text-gray-300">Min Votes (and up)</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="e.g. 50000"
                                value={filterMinVotes}
                                onChange={(e) => setFilterMinVotes(e.target.value)}
                                className="bg-surface-dark/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                              />
                            </div>

                            {/* Title Type */}
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-semibold text-gray-300">Type</label>
                              <div className="relative">
                                <select
                                  value={filterTitleType}
                                  onChange={(e) => setFilterTitleType(e.target.value)}
                                  className="appearance-none w-full bg-surface-dark/50 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm h-[40px]"
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
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-colors"
                            >
                              Clear Filters
                            </button>
                            <button
                              onClick={() => {
                                fetchMovies(0, sortBy, sortDirection);
                              }}
                              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors"
                            >
                              Apply Filter
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Active Filter Tags */}
                      {isFiltered && hasActiveFilters && (
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

                      {/* Sorting Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-dark border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">Sort by:</span>
                          <button
                            onClick={() => handleSort("averageRating")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              sortBy === "averageRating"
                                ? "bg-primary-600 border-primary-500 text-white"
                                : "bg-surface-dark border-white/10 hover:bg-white/5 text-gray-300"
                            }`}
                          >
                            Average Rating
                          </button>
                          <button
                            onClick={() => handleSort("numVotes")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              sortBy === "numVotes"
                                ? "bg-primary-600 border-primary-500 text-white"
                                : "bg-surface-dark border-white/10 hover:bg-white/5 text-gray-300"
                            }`}
                          >
                            Number of Votes
                          </button>
                        </div>

                        {sortBy && (
                          <button
                            onClick={handleSortDirection}
                            className="flex items-center gap-2 px-3 py-1.5 bg-surface-dark border border-white/10 hover:bg-white/5 text-gray-300 rounded-xl text-xs font-semibold transition-colors"
                          >
                            <ArrowUpDown className="h-3.5 w-3.5" />
                            <span>Order: {sortDirection === "desc" ? "Descending" : "Ascending"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Movie List Grid */}
                    {isLoadingMovies ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
                      </div>
                    ) : movies.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                          {movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} onContextMenu={handleContextMenu} />
                          ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6 mt-8">
                            <span className="text-xs text-gray-400">
                              Showing page {currentPage + 1} of {totalPages} ({totalElements} total results)
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => fetchMovies(currentPage - 1)}
                                disabled={currentPage === 0 || isLoadingMovies}
                                className="flex items-center gap-1 px-3 py-1.5 bg-surface-dark border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-surface-dark text-white text-xs font-semibold rounded-xl transition-all"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Previous
                              </button>

                              <div className="flex items-center gap-1">
                                {(() => {
                                  const pages: (number | string)[] = [];
                                  const delta = 1;
                                  
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
                                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-500 select-none text-xs font-semibold">
                                          ...
                                        </span>
                                      );
                                    }
                                    const pageNum = pageVal as number;
                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => fetchMovies(pageNum)}
                                        disabled={isLoadingMovies}
                                        className={`min-w-[32px] h-8 flex items-center justify-center text-xs font-semibold rounded-xl border transition-all ${
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
                                onClick={() => fetchMovies(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1 || isLoadingMovies}
                                className="flex items-center gap-1 px-3 py-1.5 bg-surface-dark border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-surface-dark text-white text-xs font-semibold rounded-xl transition-all"
                              >
                                Next
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-surface-dark/20 border border-white/5 rounded-2xl">
                        <Search className="h-10 w-10 mb-3 opacity-20" />
                        <p className="text-sm">No movies found in this genre for the selected filters.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-surface-dark/20 border border-white/5 rounded-2xl px-6 py-16 text-center">
                    <Film className="h-16 w-16 mb-6 text-primary-500/40 animate-pulse" />
                    <h3 className="text-2xl font-bold font-display text-white mb-3">Explore by Genre</h3>
                    <p className="text-sm text-text-muted-dark max-w-md mx-auto mb-8 leading-relaxed">
                      Select a movie genre from the sidebar to browse titles. You can then refine your search by applying years, ratings, and type filters, and sort results.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right-click Add To List Context Menu */}
        {contextMenu && (
          <div
            className="absolute z-50 bg-surface-elevated-dark border border-white/10 rounded-lg shadow-xl py-1.5 min-w-[150px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
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
