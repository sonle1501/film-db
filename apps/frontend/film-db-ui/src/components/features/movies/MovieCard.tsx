"use client";

import Link from "next/link";
import { Star, Users } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export interface MovieProps {
  id: string;
  title: string;
  year: number;
  rating: number;
  imageUrl: string;
  genre: string;
  votes?: number;
}

export function MovieCard({ movie, onContextMenu }: { movie: MovieProps; onContextMenu?: (e: React.MouseEvent, movieId: string) => void }) {
  const { user } = useAuthStore();

  const formatVotes = (votes?: number) => {
    if (votes === undefined || votes === null) return "---";
    if (votes >= 1000000) {
      return `${(votes / 1000000).toFixed(1)}M`;
    }
    if (votes >= 1000) {
      return `${(votes / 1000).toFixed(1)}K`;
    }
    return `${votes}`;
  };

  return (
    <Link 
      href={`/movies/${movie.id}`} 
      className="group flex flex-col bg-surface-elevated-dark border border-white/10 p-3 hover:border-cyan-accent hover:shadow-[0_0_12px_rgba(85,234,212,0.3)] hover:translate-y-[-4px] transition-all duration-300 rounded-none h-full"
      onContextMenu={(e) => {
        if (user && onContextMenu) {
          onContextMenu(e, movie.id);
        }
      }}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-dark rounded-none border border-white/5">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${movie.imageUrl})` }}
        />
        
        {/* Cyberpunk Glow Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
      
      {/* Movie Details */}
      <div className="flex flex-col mt-3 pt-2 border-t border-white/10 flex-grow justify-between">
        <div>
          {/* Title */}
          <h3 className="font-display text-base font-bold tracking-widest text-white uppercase group-hover:text-cyan-accent transition-colors duration-200 line-clamp-1 mb-2" title={movie.title}>
            {movie.title}
          </h3>
          
          {/* Row 1: Year & Genre */}
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-mono text-text-dark font-bold tracking-wider">
              [ {movie.year} ]
            </span>
            <span className="px-2 py-[2px] bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent font-mono font-bold text-[10px] tracking-wider select-none uppercase">
              {movie.genre}
            </span>
          </div>
        </div>
        
        {/* Row 2: Score & Votes */}
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <div className="flex items-center gap-1 bg-yellow-accent/10 border border-yellow-accent/30 px-2 py-0.5 font-mono text-xs font-bold text-yellow-accent select-none">
            <Star className="h-3 w-3 fill-yellow-accent text-yellow-accent" />
            <span>{(!movie.rating || movie.rating <= 0) ? "?" : movie.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 px-2 py-0.5 font-mono text-xs font-bold text-[#ff6b6b] select-none">
            <Users className="h-3 w-3 fill-[#ff6b6b] text-[#ff6b6b]" />
            <span>{formatVotes(movie.votes)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
