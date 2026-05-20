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
          <div className="aspect-[3/4] rounded-2xl bg-surface-dark flex items-center justify-center overflow-hidden border border-white/10 shadow-xl">
            <UserRound className="w-32 h-32 text-gray-500" />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <h1 className="text-4xl font-display font-bold mb-2">{person.primaryName}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {person.primaryProfession.map((profession, index) => (
              <span key={index} className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium border border-primary-500/30">
                {profession}
              </span>
            ))}
          </div>

          <div className="mt-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Personal Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-dark/50 p-4 rounded-xl border border-white/5">
                <span className="block text-sm text-gray-400 mb-1">ID</span>
                <span className="font-mono text-white">{person.personId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex items-center gap-3 mb-8">
          <Film className="w-6 h-6 text-primary-500" />
          <h2 className="text-2xl font-bold font-display">Known For</h2>
        </div>

        {person.knownForTitles && person.knownForTitles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {person.knownForTitles.map((movie) => (
              <Link href={`/movies/${movie.movieId}`} key={movie.movieId} className="group flex flex-col gap-3">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface-dark border border-white/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Film className="w-12 h-12 text-gray-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {movie.startYear && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-surface-dark/80 backdrop-blur-md rounded-md text-xs font-medium border border-white/10">
                      {movie.startYear}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors line-clamp-2" title={movie.primaryTitle}>
                    {movie.primaryTitle}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-text-muted-dark truncate">{movie.genres?.join(", ")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No known titles available.</p>
        )}
      </div>
    </div>
  );
}
