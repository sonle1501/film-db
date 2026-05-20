import { Search, SlidersHorizontal } from "lucide-react";
import { MovieCard, MovieProps } from "@/components/features/movies/MovieCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const mockSearchResults: MovieProps[] = [
  { id: "1", title: "Inception", year: 2010, rating: 8.8, imageUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=400&q=80", genre: "Action" },
  { id: "2", title: "The Matrix", year: 1999, rating: 8.7, imageUrl: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=400&q=80", genre: "Sci-Fi" },
  { id: "3", title: "Blade Runner 2049", year: 2017, rating: 8.0, imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80", genre: "Sci-Fi" },
  { id: "4", title: "Arrival", year: 2016, rating: 7.9, imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=400&q=80", genre: "Sci-Fi" },
];

export default function SearchPage() {
  const searchQuery = "Science Fiction"; // This would normally come from URL search params

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar showSearch={false} />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Search Bar Area */}
          <div className="flex flex-col gap-6 mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight">Search</h1>
            
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  defaultValue={searchQuery}
                  className="block w-full pl-11 pr-4 py-3 border border-white/10 rounded-xl bg-surface-dark/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Search for movies, TV shows, or people..."
                />
              </div>
              
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-dark/80 hover:bg-surface-dark border border-white/10 rounded-xl text-white transition-colors whitespace-nowrap">
                <SlidersHorizontal className="h-5 w-5" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Results Metadata and Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-xl font-medium text-white">
                Results for <span className="font-bold text-primary-400">"{searchQuery}"</span>
              </h2>
              <span className="text-sm text-gray-400">
                Found <span className="text-white font-medium">{mockSearchResults.length}</span> results
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-4">
              {mockSearchResults.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
