import { fetchApi } from "@/lib/api-server";
import { PersonDetailInfo } from "@/types/imdb";
import Link from "next/link";
import { UserRound, Film, Star } from "lucide-react";

export default async function PersonDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  let person: PersonDetailInfo | null = null;
  let error: string | null = null;

  try {
    person = await fetchApi(`/api/v1/imdb/person/${id}/details`);
  } catch (e: any) {
    error = e.message || "Failed to load person details";
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-white flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-3xl font-display font-bold mb-4 text-red-500">Error</h1>
        <p className="text-text-muted-dark">{error}</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-white flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-3xl font-display font-bold mb-4">Person not found</h1>
        <p className="text-text-muted-dark">The person with ID {id} could not be found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-white">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="aspect-[3/4] rounded-none bg-surface-dark flex items-center justify-center overflow-hidden border border-white/10 shadow-xl">
            <UserRound className="w-32 h-32 text-text-muted-dark" />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <h1 className="text-4xl font-display font-bold mb-2 uppercase tracking-wide text-white">{person.primaryName}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {person.primaryProfession.map((profession, index) => (
              <span key={index} className="px-3 py-1 bg-cyan-accent/5 text-cyan-accent border border-cyan-accent/20 rounded-none text-xs font-mono font-bold uppercase">
                {profession}
              </span>
            ))}
          </div>

          <div className="mt-auto">
            <h2 className="text-sm font-bold font-display uppercase tracking-wider mb-4 text-text-muted-dark">// PERSONAL_INFO</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-dark/50 p-4 rounded-none border border-white/10">
                <span className="block text-[10px] font-mono uppercase text-text-muted-dark mb-1">ID</span>
                <span className="font-mono text-sm text-white font-bold">{person.personId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex items-center gap-3 mb-8">
          <Film className="w-5 h-5 text-cyan-accent" />
          <h2 className="text-xl font-bold font-display uppercase tracking-wider">// KNOWN_FOR</h2>
        </div>

        {person.knownForTitles && person.knownForTitles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {person.knownForTitles.map((movie) => (
              <Link href={`/movies/${movie.movieId}`} key={movie.movieId} className="group flex flex-col border border-white/10 p-2 bg-surface-elevated-dark hover:border-cyan-accent hover:translate-y-[-2px] transition-all duration-150 rounded-none shadow-md">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-none bg-surface-dark border border-white/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Film className="w-10 h-10 text-text-muted-dark/40 group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {movie.startYear && (
                    <div className="absolute top-2 right-2 bg-yellow-accent/15 border border-yellow-accent/40 px-2 py-0.5 font-display text-[9px] font-bold text-yellow-accent uppercase tracking-widest rounded-none shadow-[0_0_8px_rgba(243,230,0,0.2)]">
                      {movie.startYear}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col mt-2 pt-1 border-t border-white/[0.03]">
                  <h3 className="font-display text-xs font-bold tracking-widest text-white uppercase group-hover:text-cyan-accent transition-colors line-clamp-2" title={movie.primaryTitle}>
                    {movie.primaryTitle}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-display text-text-muted-dark uppercase truncate">{movie.genres?.join(", ")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="font-mono text-xs text-text-muted-dark uppercase">[ NO KNOWN TITLES AVAILABLE ]</p>
        )}
      </div>
    </div>
  );
}
