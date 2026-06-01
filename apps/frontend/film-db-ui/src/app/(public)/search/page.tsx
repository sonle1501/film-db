"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Info, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { MovieCard, MovieProps } from "@/components/features/movies/MovieCard";
import { getMoviePosterUrl } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { searchApi } from "@/lib/api-client";
import { MovieSearchResultDto } from "@/types/imdb";
import { AddToListModal } from "@/components/features/movies/AddToListModal";
import { useAuthStore } from "@/store/useAuthStore";
import { LiveSearchInput } from "@/components/ui/LiveSearchInput";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  
  const qParam = searchParams.get("q") || "";
  const modeParam = (searchParams.get("mode") as "smart" | "vn") || "smart";
  
  const [inputValue, setInputValue] = useState(qParam);
  const [searchMode, setSearchMode] = useState<"smart" | "vn">(modeParam);
  const [results, setResults] = useState<MovieSearchResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Context Menu & Modal for List Additions
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; movieId: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string>("");
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync inputs with URL
  useEffect(() => {
    setInputValue(qParam);
  }, [qParam]);

  useEffect(() => {
    setSearchMode(modeParam);
  }, [modeParam]);

  // Fetch results when query, mode or page changes
  useEffect(() => {
    fetchResults(qParam, modeParam, currentPage);
  }, [qParam, modeParam, currentPage]);

  const updateUrl = (q: string, mode: "smart" | "vn") => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (mode !== "smart") params.set("mode", mode);
    router.push(`/search?${params.toString()}`);
  };


  const handleModeChange = (mode: "smart" | "vn") => {
    setSearchMode(mode);
    setCurrentPage(0);
    updateUrl(inputValue, mode);
  };

  const fetchResults = async (q: string, mode: "smart" | "vn", page: number) => {
    if (!q.trim()) {
      setResults([]);
      setTotalPages(0);
      setTotalElements(0);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      let data;
      if (mode === "vn") {
        data = await searchApi.searchVietnamese(q.trim(), page, 10);
      } else {
        data = await searchApi.searchSmart(q.trim(), page, 10);
      }

      if (!controller.signal.aborted) {
        setResults(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err: any) {
      if (err.name !== "CanceledError" && !controller.signal.aborted) {
        console.error("Search error:", err);
        setError(err.response?.data?.message || err.message || "An error occurred during search");
        setResults([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, movieId: string) => {
    if (!user) return;
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, movieId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    window.addEventListener("click", closeContextMenu);
    return () => window.removeEventListener("click", closeContextMenu);
  }, []);

  const mapMovieProps = (movie: MovieSearchResultDto): MovieProps => ({
    id: movie.movieId,
    title: movie.primaryTitle || movie.originalTitle || "Unknown Title",
    year: movie.startYear || new Date().getFullYear(),
    rating: movie.averageRating || 0,
    genre: movie.genres && movie.genres.length > 0 ? movie.genres[0] : "Unknown",
    imageUrl: getMoviePosterUrl(movie.imageUrl),
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar showSearch={false} />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Search Header */}
          <div className="flex flex-col gap-6 mb-10">
            <h1 className="text-3xl font-bold font-display uppercase tracking-widest text-white">// SEARCH</h1>
            
              <div className="w-full">
                <LiveSearchInput
                  variant="search"
                  initialValue={qParam}
                  searchMode={searchMode}
                  placeholder="Search for movies, TV series, actors..."
                  onInputChange={(val) => setInputValue(val)}
                  onSearchSubmit={(q) => {
                    setCurrentPage(0);
                    updateUrl(q, searchMode);
                  }}
                />
              </div>
              
              {/* Search Mode Toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleModeChange("smart")}
                    className={`px-4 py-2 rounded-none text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                      searchMode === "smart"
                        ? "bg-cyan-accent/20 border-cyan-accent text-cyan-accent shadow-[0_0_8px_rgba(85,234,212,0.2)]"
                        : "bg-surface-dark/50 border-white/10 text-text-muted-dark hover:text-white hover:bg-white/5"
                    }`}
                  >
                    [ SMART SEARCH ]
                  </button>
                  <button
                    onClick={() => handleModeChange("vn")}
                    className={`px-4 py-2 rounded-none text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                      searchMode === "vn"
                        ? "bg-cyan-accent/20 border-cyan-accent text-cyan-accent shadow-[0_0_8px_rgba(85,234,212,0.2)]"
                        : "bg-surface-dark/50 border-white/10 text-text-muted-dark hover:text-white hover:bg-white/5"
                    }`}
                  >
                    [ VIETNAMESE LOCALIZED ]
                  </button>
                </div>
                
                {searchMode === "vn" && (
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-cyan-accent bg-cyan-accent/5 border border-cyan-accent/20 px-3 py-1.5 rounded-none">
                    <Info className="h-3.5 w-3.5 text-cyan-accent" />
                    <span>Vietnamese mode matches accents and tones accurately.</span>
                  </div>
                )}
              </div>
            </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-accent/10 border border-red-accent/30 rounded-none text-red-accent text-xs font-mono uppercase">
              {error}
            </div>
          )}

          {/* Results Grid */}
          <div className="space-y-6">
            {qParam.trim() && (
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h2 className="text-xl font-bold font-display uppercase tracking-wider text-white">
                  Results for <span className="text-cyan-accent">"{qParam}"</span>
                </h2>
                <span className="text-xs font-mono uppercase text-text-muted-dark font-bold">
                  Found <span className="text-white font-bold">{totalElements}</span> results
                </span>
              </div>
            )}
            
            {isLoading && results.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-4">
                  {results.map((movie) => (
                    <MovieCard
                      key={movie.movieId}
                      movie={mapMovieProps(movie)}
                      onContextMenu={handleContextMenu}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6 mt-8">
                    <span className="text-xs font-mono uppercase text-text-muted-dark font-bold">
                      Showing page {currentPage + 1} of {totalPages} ({totalElements} total results)
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 0 || isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-surface-dark border border-white/10 hover:border-white/20 disabled:opacity-30 disabled:hover:bg-surface-dark text-white text-xs font-mono font-bold uppercase rounded-none transition-all cursor-pointer"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 text-cyan-accent" />
                        PREVIOUS
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
                                <span key={`ellipsis-${idx}`} className="px-2 py-2 text-text-muted-dark select-none text-xs font-mono font-bold">
                                  ...
                                </span>
                              );
                            }
                            const pageNum = pageVal as number;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
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
                        onClick={() => setCurrentPage(currentPage + 1)}
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
            ) : qParam.trim() ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p>No results found for your search query.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p>Type a name above to search for movies and TV series.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add to List Dialog / Menu */}
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Navbar showSearch={false} />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        </main>
        <Footer />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
