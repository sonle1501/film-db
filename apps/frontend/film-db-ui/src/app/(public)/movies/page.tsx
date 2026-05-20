"use client";

import { useState } from "react";
import { Search, Flame, Trophy, Tv, SlidersHorizontal, Loader2 } from "lucide-react";
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
      return;
    }

    setIsLoading(true);
    setError(null);
    setActiveFilter(null);

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
              
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-dark/80 hover:bg-surface-dark border border-white/10 rounded-xl text-white transition-colors whitespace-nowrap">
                <SlidersHorizontal className="h-5 w-5" />
                <span>Filter</span>
              </button>
            </div>

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
                 activeFilter === 'trending' ? "Trending Now" :
                 activeFilter === 'top250' ? "Top 250 Movies" :
                 activeFilter === 'toptv' ? "Top TV Series" : "Trending Now"}
              </h2>
              <span className="text-sm text-gray-400">Showing {movies.length} results</span>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              </div>
            ) : movies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} onContextMenu={handleContextMenu} />
                ))}
              </div>
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
