"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Search, Loader2, Film, Star, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLiveSearch } from "@/hooks/useLiveSearch";
import { getMoviePosterUrl } from "@/lib/utils";

interface LiveSearchInputProps {
  variant?: "navbar" | "hero" | "search";
  initialValue?: string;
  placeholder?: string;
  searchMode?: "smart" | "vn";
  onSearchSubmit?: (query: string) => void;
  onInputChange?: (value: string) => void;
}

const searchFormSchema = z.object({
  searchQuery: z.string(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export function LiveSearchInput({
  variant = "navbar",
  initialValue = "",
  placeholder = "Search movies...",
  searchMode = "smart",
  onSearchSubmit,
  onInputChange,
}: LiveSearchInputProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit: handleFormSubmit, setValue, watch } = useForm<SearchFormValues>({
    defaultValues: {
      searchQuery: initialValue,
    },
  });

  const query = watch("searchQuery");
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);

  // Sync initialValue changes
  useEffect(() => {
    setValue("searchQuery", initialValue);
    setDebouncedQuery(initialValue);
  }, [initialValue, setValue]);

  // Handle onChange side-effects
  useEffect(() => {
    if (onInputChange) {
      onInputChange(query);
    }
  }, [query, onInputChange]);

  // Debounce query input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query || "");
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Call the react-query hook
  const { data: results = [], isLoading } = useLiveSearch(debouncedQuery, searchMode, 5);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSubmit = (data: SearchFormValues) => {
    const trimmed = data.searchQuery.trim();
    if (!trimmed) return;
    
    setIsOpen(false);
    inputRef.current?.blur();

    if (onSearchSubmit) {
      onSearchSubmit(trimmed);
    } else {
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(trimmed)}&mode=${searchMode}`);
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Determine styling based on variant
  let containerClass = "relative w-full";
  let inputClass = "";
  let iconClass = "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors";
  let buttonClass = "absolute right-2 top-1/2 -translate-y-1/2 rounded-lg text-sm font-medium transition-all";

  if (variant === "navbar") {
    containerClass += " max-w-xs";
    inputClass = "w-full rounded-full bg-elevated/40 hover:bg-elevated/60 border border-white/10 py-1.5 pl-9 pr-8 text-xs text-white placeholder-text-muted-dark focus:bg-elevated/80 focus:border-primary-500/80 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all duration-200";
    iconClass = "absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted-dark";
  } else if (variant === "hero") {
    inputClass = "w-full rounded-full bg-surface-dark/40 hover:bg-surface-dark/60 border border-white/10 py-4 pl-12 pr-32 text-base text-white placeholder-gray-400 focus:bg-surface-dark/80 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 backdrop-blur-md transition-all duration-200";
    iconClass = "absolute left-4.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400";
    buttonClass += " px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-95 text-sm";
  } else { // "search" page variant
    inputClass = "w-full rounded-xl bg-surface-dark/40 hover:bg-surface-dark/60 border border-white/10 py-3.5 pl-12 pr-28 text-sm text-white placeholder-gray-400 focus:bg-surface-dark/80 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200";
    iconClass = "absolute left-4.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400";
    buttonClass += " px-4 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs";
  }

  return (
    <div className={containerClass} ref={dropdownRef}>
      <form onSubmit={handleFormSubmit(onSubmit)} className="relative w-full">
        <Search className={`${iconClass} ${isOpen ? "text-primary-500" : ""}`} />
        <input
          {...register("searchQuery")}
          ref={(node) => {
            inputRef.current = node;
            register("searchQuery").ref(node);
          }}
          type="text"
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={inputClass}
        />
        {query?.trim() && (
          <button
            type="submit"
            disabled={isPending}
            className={variant === "navbar" ? "absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted-dark hover:text-white" : buttonClass}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : variant === "navbar" ? (
              <ArrowRight className="h-3.5 w-3.5" />
            ) : (
              "Search"
            )}
          </button>
        )}
      </form>

      {/* Live Search Dropdown */}
      {isOpen && (isLoading || results.length > 0 || (query?.trim() && !isLoading)) && (
        <div className="absolute left-0 right-0 z-50 mt-2 origin-top-right rounded-2xl border border-white/10 bg-surface-dark/95 p-2 shadow-2xl backdrop-blur-xl transition-all max-h-[380px] overflow-y-auto">
          {isLoading && results.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-sm text-text-muted-dark gap-2">
              <Loader2 className="h-4 w-4 text-primary-500 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-1 text-[10px] font-semibold text-text-muted-dark uppercase tracking-wider">
                Suggestions ({searchMode === "vn" ? "Vietnamese" : "Smart"})
              </div>
              {results.map((movie) => (
                <button
                  key={movie.movieId}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/movies/${movie.movieId}`);
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/5 transition-all group"
                >
                  <div className="relative h-10 w-8 overflow-hidden rounded bg-elevated/50 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getMoviePosterUrl(movie.imageUrl)}
                      alt={movie.primaryTitle || movie.originalTitle}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium text-white group-hover:text-primary-400 transition-colors">
                      {movie.primaryTitle || movie.originalTitle}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted-dark mt-0.5">
                      <span>{movie.startYear}</span>
                      {movie.genres && movie.genres.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="truncate">{movie.genres[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {movie.averageRating > 0 && (
                    <div className="flex items-center gap-1 rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-500 border border-yellow-500/20 shrink-0">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      <span>{movie.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </button>
              ))}
              <div className="border-t border-white/5 mt-1 pt-1">
                <button
                  onClick={() => onSubmit({ searchQuery: query || "" })}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-center text-xs font-semibold text-primary-400 hover:text-primary-300 hover:bg-primary-500/5 transition-all"
                >
                  <span>View all results for "{query}"</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : query?.trim() ? (
            <div className="py-6 text-center text-sm text-text-muted-dark">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
