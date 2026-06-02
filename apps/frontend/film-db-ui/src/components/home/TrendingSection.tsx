import { MovieCard, type MovieProps } from "@/components/features/movies/MovieCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Mock data to show the beautiful design before API integration
const MOCK_MOVIES: MovieProps[] = [
  {
    id: "1",
    title: "Dune: Part Two",
    year: 2024,
    rating: 8.8,
    genre: "Sci-Fi",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
    votes: 432500,
  },
  {
    id: "2",
    title: "Oppenheimer",
    year: 2023,
    rating: 8.4,
    genre: "Biography",
    imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop",
    votes: 752100,
  },
  {
    id: "3",
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    rating: 8.6,
    genre: "Animation",
    imageUrl: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=600&auto=format&fit=crop",
    votes: 389400,
  },
  {
    id: "4",
    title: "The Batman",
    year: 2022,
    rating: 7.8,
    genre: "Action",
    imageUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=600&auto=format&fit=crop",
    votes: 894000,
  },
  {
    id: "5",
    title: "Everything Everywhere All at Once",
    year: 2022,
    rating: 8.0,
    genre: "Adventure",
    imageUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600&auto=format&fit=crop",
    votes: 450300,
  },
];

export function TrendingSection() {
  return (
    <section className="py-16 bg-surface-dark border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-widest text-white uppercase mb-1">// TRENDING_LIST</h2>
            <p className="text-xs font-display tracking-widest text-text-muted-dark uppercase">ACTIVE_POPULARITY_INDEX // WEEKLY_UPDATES</p>
          </div>
          <Link 
            href="/trending" 
            className="hidden sm:flex items-center gap-1.5 text-xs font-display uppercase tracking-widest text-primary-500 hover:text-white transition-colors"
          >
            [ ACCESS_ALL_RECORDS ]
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {MOCK_MOVIES.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        
        <div className="mt-8 flex justify-center sm:hidden">
          <Link 
            href="/trending" 
            className="flex h-10 w-full items-center justify-center border border-primary-500 bg-transparent text-xs font-display uppercase tracking-widest text-primary-500 hover:bg-primary-500 hover:text-surface-dark transition-all duration-150"
          >
            ACCESS_ALL_RECORDS
          </Link>
        </div>
      </div>
    </section>
  );
}
