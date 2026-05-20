import { fetchApi } from "@/lib/api-server";
import { FullMovieInfo } from "@/types/imdb";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Star, Clock, Calendar, Users } from "lucide-react";
import { MovieSupplementaryInfoSection } from "./MovieSupplementaryInfoSection";
import { MovieContextMenuWrapper } from "@/components/features/movies/MovieContextMenuWrapper";
import Link from "next/link";

async function getMovie(id: string): Promise<FullMovieInfo | null> {
  try {
    const data = await fetchApi(`/api/v1/imdb/film/full/${encodeURIComponent(id)}`);
    return data as FullMovieInfo;
  } catch (error) {
    return null;
  }
}

export default async function MovieDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const movie = await getMovie(id);

  if (!movie) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar showSearch={true} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-white mb-4">Movie Not Found</h1>
            <p className="text-gray-400">Could not find movie with ID: {id}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Use unsplash placeholder or default poster image
  const posterUrl = "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar showSearch={true} />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-[60vh] w-full">
          <div className="absolute inset-0">
            <img 
              src={posterUrl} 
              alt={movie.primaryTitle} 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/80 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 w-full">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
              <div className="flex flex-col md:flex-row gap-8 items-end">
                {/* Poster */}
                <MovieContextMenuWrapper movieId={movie.movieId} className="hidden md:block w-64 h-96 rounded-xl overflow-hidden border-4 border-surface-dark shadow-2xl relative z-10 flex-shrink-0 bg-surface-dark cursor-context-menu">
                  <img 
                    src={posterUrl} 
                    alt={movie.primaryTitle} 
                    className="w-full h-full object-cover"
                  />
                </MovieContextMenuWrapper>
                
                {/* Details */}
                <div className="flex-grow relative z-10">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres?.map(genre => (
                      <span key={genre} className="px-3 py-1 bg-primary-600/20 text-primary-400 border border-primary-500/30 rounded-full text-xs font-medium">
                        {genre}
                      </span>
                    ))}
                    {movie.isAdult && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-medium">
                        Adult 18+
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-2">
                    {movie.primaryTitle || 'Unknown Title'}
                  </h1>
                  
                  {movie.originalTitle && movie.originalTitle !== movie.primaryTitle && (
                    <p className="text-xl text-gray-400 mb-6 font-display italic">
                      {movie.originalTitle}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-white text-lg">
                        {movie.averageRating != null ? movie.averageRating.toFixed(1) : "N/A"}
                      </span>
                      <span>
                        ({movie.numVotes != null ? movie.numVotes.toLocaleString() : 0} votes)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>{movie.startYear || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span>{movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : "Unknown runtime"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">About</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  No plot summary available for this title. 
                </p>
              </section>

              {/* Cast & Crew from moviePersons */}
              {movie.persons && movie.persons.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary-500" />
                    Cast & Crew
                  </h2>
                  <div className="bg-surface-dark/50 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                      {movie.persons.map((person, index) => (
                        <Link href={`/people/${person.personId}`} key={`${person.personId}-${index}`} className="flex flex-col bg-surface-dark/50 p-4 rounded-xl hover:bg-surface-dark transition-colors group">
                          <span className="text-white font-bold mb-1 group-hover:text-primary-400 transition-colors">
                            {person.primaryName}
                          </span>
                          <span className="text-xs text-gray-400 mb-2">
                            {person.category} {person.job ? `(${person.job})` : ""}
                          </span>
                          {person.characters && person.characters !== "[]" && (
                            <span className="text-sm text-primary-400">
                              as {person.characters.replace(/[\[\]"]/g, '')}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}
              
              <MovieSupplementaryInfoSection movieId={movie.movieId} />
            </div>
            
            <div className="space-y-8">
              <div className="bg-surface-dark/80 border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">Movie Info</h3>
                <dl className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <dt className="text-gray-400">ID</dt>
                    <dd className="text-white font-mono">{movie.movieId}</dd>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <dt className="text-gray-400">Release Year</dt>
                    <dd className="text-white">{movie.startYear || "Unknown"}</dd>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <dt className="text-gray-400">Runtime</dt>
                    <dd className="text-white">{movie.runtimeMinutes ? `${movie.runtimeMinutes} minutes` : "Unknown"}</dd>
                  </div>
                  <div className="flex justify-between pb-2">
                    <dt className="text-gray-400">Rating</dt>
                    <dd className="text-white">{movie.averageRating != null ? `${movie.averageRating}/10` : "N/A"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
