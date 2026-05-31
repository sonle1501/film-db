"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export interface MovieProps {
  id: string;
  title: string;
  year: number;
  rating: number;
  imageUrl: string;
  genre: string;
}

export function MovieCard({ movie, onContextMenu }: { movie: MovieProps; onContextMenu?: (e: React.MouseEvent, movieId: string) => void }) {
  const { user } = useAuthStore();

  return (
    <Link 
      href={`/movies/${movie.id}`} 
      className="group flex flex-col bg-surface-elevated-dark border border-white/10 p-2 hover:border-primary-500 hover:translate-y-[-2px] transition-all duration-150 rounded-none shadow-md"
      onContextMenu={(e) => {
        if (user && onContextMenu) {
          onContextMenu(e, movie.id);
        }
      }}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-dark rounded-none border border-white/5">
        {/* Poster Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${movie.imageUrl})` }}
        />
        
        {/* Cyberpunk Glow Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-2 left-2 right-2 border-b border-primary-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge - Cyberpunk Style */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-accent/15 border border-yellow-accent/40 px-2 py-0.5 font-display text-[9px] font-bold text-yellow-accent uppercase tracking-widest rounded-none shadow-[0_0_8px_rgba(243,230,0,0.2)]">
          <Star className="h-2.5 w-2.5 fill-yellow-accent text-yellow-accent" />
          <span>{movie.rating.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="flex flex-col mt-2 pt-1 border-t border-white/[0.03]">
        <h3 className="font-display text-xs font-bold tracking-widest text-white uppercase group-hover:text-primary-500 transition-colors truncate">
          {movie.title}
        </h3>
        <div className="flex justify-between items-center text-[9px] font-display text-text-muted-dark uppercase mt-1">
          <span>{movie.year}</span>
          <span className="px-1 py-[1px] bg-primary-500/10 border border-primary-500/20 text-primary-500/80 font-black text-[8px] tracking-wider select-none">
            {movie.genre}
          </span>
        </div>
      </div>
    </Link>
  );
}
