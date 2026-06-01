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
  let iconClass = "absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors";
  let buttonClass = "absolute right-2 top-1/2 -translate-y-1/2 rounded-none text-xs font-display uppercase tracking-widest transition-all";

  if (variant === "navbar") {
    containerClass += " max-w-xs";
    inputClass = "w-full rounded-none bg-surface-elevated-dark/90 hover:bg-surface-elevated-dark border border-white/10 py-1.5 pl-8 pr-8 text-xs font-display text-white placeholder-text-muted-dark focus:border-primary-500 focus:outline-none transition-all duration-150";
    iconClass = "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted-dark";
  } else if (variant === "hero") {
    inputClass = "w-full rounded-none bg-surface-elevated-dark/85 hover:bg-surface-elevated-dark border border-white/10 py-5 pl-14 pr-36 text-sm font-display text-white placeholder-text-muted-dark focus:border-primary-500 focus:outline-none transition-all duration-150";
    iconClass = "absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-500 font-bold";
    buttonClass += " px-6 py-2.5 border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-surface-dark";
  } else { // "search" page variant
    inputClass = "w-full rounded-none bg-surface-elevated-dark border border-white/10 py-3.5 pl-12 pr-28 text-sm font-display text-white placeholder-text-muted-dark focus:border-primary-500 focus:outline-none transition-all duration-150";
    iconClass = "absolute left-4.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-primary-500 font-bold";
    buttonClass += " px-4 py-1.5 border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-surface-dark";
  }

  return (
    <div className={containerClass} ref={dropdownRef}>
      <form onSubmit={handleFormSubmit(onSubmit)} className="relative w-full">
        {variant === "navbar" ? (
          <Search className={`${iconClass} ${isOpen ? "text-primary-500" : ""}`} />
        ) : (
          <div className={`${iconClass} flex items-center justify-center font-display text-primary-500 font-black text-lg select-none`}>
            &gt;
          </div>
        )}
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
            className={variant === "navbar" ? "absolute right-2.5 top-1/2 -translate-y-1/2 text-primary-500 hover:text-white" : buttonClass}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : variant === "navbar" ? (
              <ArrowRight className="h-3.5 w-3.5" />
            ) : (
              "EXECUTE"
            )}
          </button>
        )}
      </form>

      {/* Live Search Dropdown */}
      {isOpen && (isLoading || results.length > 0 || (query?.trim() && !isLoading)) && (
        <div className="absolute left-0 right-0 z-50 mt-2 origin-top-right rounded-none border border-white/10 bg-surface-elevated-dark p-2 shadow-2xl backdrop-blur-xl transition-all max-h-[380px] overflow-y-auto">
          {isLoading && results.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-xs font-display text-text-muted-dark gap-2">
              <Loader2 className="h-4 w-4 text-primary-500 animate-spin" />
              <span>COMMUNICATION ACTIVE...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-1 text-[10px] font-display font-semibold text-text-muted-dark uppercase tracking-widest border-b border-white/5 pb-2 mb-1">
                // SUGGESTIONS ({searchMode === "vn" ? "VIETNAMESE" : "SMART"})
              </div>
              {results.map((movie) => (
                <button
                  key={movie.movieId}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/movies/${movie.movieId}`);
                  }}
                  className="flex items-center gap-3 rounded-none border border-transparent hover:border-primary-500/20 px-3 py-2 text-left hover:bg-white/5 transition-all group"
                >
                  <div className="relative h-10 w-8 overflow-hidden rounded-none bg-surface-dark border border-white/10 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getMoviePosterUrl(movie.imageUrl)}
                      alt={movie.primaryTitle || movie.originalTitle}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-display uppercase tracking-widest text-white group-hover:text-primary-500 transition-colors">
                      {movie.primaryTitle || movie.originalTitle}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-display text-text-muted-dark mt-0.5">
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
                    <div className="flex items-center gap-1 rounded-none bg-yellow-accent/10 px-1.5 py-0.5 text-[9px] font-display font-semibold text-yellow-accent border border-yellow-accent/20 shrink-0">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      <span>{movie.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </button>
              ))}
              <div className="border-t border-white/10 mt-1 pt-1">
                <button
                  onClick={() => onSubmit({ searchQuery: query || "" })}
                  className="flex w-full items-center justify-center gap-1.5 rounded-none py-2 text-center text-[10px] font-display uppercase tracking-widest text-primary-500 hover:text-white hover:bg-primary-500/5 transition-all"
                >
                  <span>[ EXECUTE DEEPER SEARCH FOR "{query}" ]</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : query?.trim() ? (
            <div className="py-6 text-center text-xs font-display text-text-muted-dark">
              NO CORRELATION FOUND FOR "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
