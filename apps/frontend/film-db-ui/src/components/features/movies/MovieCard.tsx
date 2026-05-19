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
      className="group flex flex-col gap-3"
      onContextMenu={(e) => {
        if (user && onContextMenu) {
          onContextMenu(e, movie.id);
        }
      }}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-elevated/50">
        {/* Placeholder image representation since we don't have real images yet */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${movie.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/90 via-surface-dark/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Hover Action / Details */}
        <div className="absolute bottom-0 left-0 flex w-full translate-y-4 flex-col p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-xs font-medium text-primary-400">{movie.genre}</p>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-surface-dark/80 px-2 py-1 backdrop-blur-md border border-white/10">
          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          <span className="text-xs font-medium text-white">{movie.rating.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="flex flex-col">
        <h3 className="truncate font-medium text-white group-hover:text-primary-400 transition-colors">
          {movie.title}
        </h3>
        <p className="text-sm text-text-muted-dark">{movie.year}</p>
      </div>
    </Link>
  );
}
