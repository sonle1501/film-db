import { fetchApi } from "@/lib/api-server";
import { getMoviePosterUrl } from "@/lib/utils";
import { FullMovieInfo } from "@/types/imdb";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Star, Clock, Calendar, Users } from "lucide-react";
import { MovieSupplementaryInfoSection } from "./MovieSupplementaryInfoSection";
import { MovieContextMenuWrapper } from "@/components/features/movies/MovieContextMenuWrapper";
import { SeasonsAndEpisodes } from "@/components/features/movies/SeasonsAndEpisodes";
import Link from "next/link";

async function getMovie(id: string): Promise<FullMovieInfo | null> {
  try {
    const data = await fetchApi(`/api/v1/imdb/film/full/${encodeURIComponent(id)}`);
    return data as FullMovieInfo;
  } catch (error) {
    return null;
  }
}

async function getSeasonsCount(id: string): Promise<number> {
  try {
    const data = await fetchApi(`/api/v1/imdb/tvseries/${encodeURIComponent(id)}/seasons`);
    return typeof data === 'number' ? data : 0;
  } catch (error) {
    return 0;
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

  const seasonsCount = await getSeasonsCount(id);

  // Resolve TMDB poster image or use fallback
  const posterUrl = getMoviePosterUrl(movie.imageUrl);

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
                <MovieContextMenuWrapper movieId={movie.movieId} className="hidden md:block w-64 h-96 rounded-none overflow-hidden border border-white/10 shadow-2xl relative z-10 flex-shrink-0 bg-black/40 cursor-context-menu">
                  <img 
                    src={posterUrl} 
                    alt={movie.primaryTitle} 
                    className="w-full h-full object-cover"
                  />
                </MovieContextMenuWrapper>
                
                {/* Details */}
                <div className="flex-grow relative z-10 font-mono">
                  <div className="flex flex-wrap gap-2.5 mb-4">
                    {movie.genres?.map(genre => (
                      <span key={genre} className="px-2.5 py-0.5 bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/25 rounded-none text-xs uppercase tracking-wider font-bold">
                        {genre}
                      </span>
                    ))}
                    {movie.isAdult && (
                      <span className="px-2.5 py-0.5 bg-red-accent/10 text-red-accent border border-red-accent/25 rounded-none text-xs uppercase tracking-wider font-bold">
                        ADULT 18+
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-2 uppercase tracking-wide">
                    {movie.primaryTitle || 'Unknown Title'}
                  </h1>
                  
                  {movie.originalTitle && movie.originalTitle !== movie.primaryTitle && (
                    <p className="text-lg text-text-muted-dark mb-6 font-display italic">
                      // {movie.originalTitle}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-6 text-xs text-gray-300 uppercase tracking-widest mt-4">
                    <div className="flex items-center gap-2 border border-yellow-accent/20 bg-yellow-accent/5 px-2 py-1 text-yellow-accent">
                      <Star className="w-3.5 h-3.5 fill-yellow-accent text-yellow-accent" />
                      <span className="font-bold text-base">
                        {movie.averageRating != null ? movie.averageRating.toFixed(1) : "N/A"}
                      </span>
                      <span className="text-xs text-yellow-accent/70 font-mono">
                        ({movie.numVotes != null ? movie.numVotes.toLocaleString() : 0} VOTES)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 border border-white/5 bg-black/40 px-2 py-1 text-text-muted-dark font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{movie.startYear || "UNKNOWN"}</span>
                    </div>
                    <div className="flex items-center gap-2 border border-white/5 bg-black/40 px-2 py-1 text-text-muted-dark font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{movie.runtimeMinutes ? `${movie.runtimeMinutes} MIN` : "UNKNOWN"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12 max-w-7xl font-mono text-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">// ABOUT</h2>
                <p className="text-gray-300 leading-relaxed text-sm font-sans italic">
                  No plot summary available for this title. 
                </p>
              </section>

              {/* Cast & Crew from moviePersons */}
              {movie.persons && movie.persons.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-accent" />
                    // CAST_AND_CREW
                  </h2>
                  <div className="bg-black/20 border border-white/10 rounded-none overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                      {movie.persons.map((person, index) => (
                        <Link href={`/people/${person.personId}`} key={`${person.personId}-${index}`} className="flex flex-col bg-black/40 p-4 rounded-none border border-transparent hover:border-cyan-accent/20 hover:bg-white/5 transition-all group">
                          <span className="text-white font-bold mb-1 group-hover:text-cyan-accent transition-colors font-mono uppercase tracking-wider text-sm">
                            {person.primaryName}
                          </span>
                          <span className="text-xs text-text-muted-dark mb-2 font-mono uppercase">
                            {person.category} {person.job ? `(${person.job})` : ""}
                          </span>
                          {person.characters && person.characters !== "[]" && (
                            <span className="text-xs text-cyan-accent font-mono">
                              as {person.characters.replace(/[\[\]"]/g, '')}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Seasons & Episodes */}
              {seasonsCount > 0 && (
                <SeasonsAndEpisodes movieId={movie.movieId} seasonsCount={seasonsCount} />
              )}
              
              <MovieSupplementaryInfoSection movieId={movie.movieId} />
            </div>
            
            <div className="space-y-8">
              <div className="bg-black/20 border border-white/10 rounded-none p-6 font-mono">
                <h3 className="font-bold text-white mb-4 uppercase tracking-widest pb-2 border-b border-white/10">// METADATA_LOG</h3>
                <dl className="space-y-4 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <dt className="text-text-muted-dark uppercase tracking-wider">ID</dt>
                    <dd className="text-cyan-accent font-mono font-bold uppercase">{movie.movieId}</dd>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <dt className="text-text-muted-dark uppercase tracking-wider">Release Year</dt>
                    <dd className="text-white font-bold">{movie.startYear || "Unknown"}</dd>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <dt className="text-text-muted-dark uppercase tracking-wider">Runtime</dt>
                    <dd className="text-white font-bold">{movie.runtimeMinutes ? `${movie.runtimeMinutes} minutes` : "Unknown"}</dd>
                  </div>
                  <div className="flex justify-between pb-2">
                    <dt className="text-text-muted-dark uppercase tracking-wider">Rating</dt>
                    <dd className="text-yellow-accent font-bold">{movie.averageRating != null ? `${movie.averageRating}/10` : "N/A"}</dd>
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
