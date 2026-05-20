import { Search, Filter, Star, UserRound } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchApi } from "@/lib/api-server";
import { PersonInfo } from "@/types/imdb";

interface PersonProps {
  id: string;
  name: string;
  knownFor: string;
  popularity: number;
  imageUrl: string;
}

const mockPeople: PersonProps[] = [
  { id: "1", name: "Christopher Nolan", knownFor: "Directing", popularity: 98.5, imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
  { id: "2", name: "Zendaya", knownFor: "Acting", popularity: 97.2, imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
  { id: "3", name: "Cillian Murphy", knownFor: "Acting", popularity: 96.8, imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
  { id: "4", name: "Denis Villeneuve", knownFor: "Directing", popularity: 95.4, imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80" },
  { id: "5", name: "Florence Pugh", knownFor: "Acting", popularity: 94.9, imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
  { id: "6", name: "Timothée Chalamet", knownFor: "Acting", popularity: 94.5, imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" },
  { id: "7", name: "Emma Stone", knownFor: "Acting", popularity: 93.8, imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80" },
  { id: "8", name: "Ryan Gosling", knownFor: "Acting", popularity: 93.1, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
];

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  let searchedPerson: PersonInfo | null = null;
  let error: string | null = null;

  if (q) {
    try {
      searchedPerson = await fetchApi(`/api/v1/imdb/person/${q}`);
    } catch (e: any) {
      error = "Person not found or API error";
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar showSearch={false} />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header and Search */}
          <div className="flex flex-col gap-6 mb-12">
            <h1 className="text-3xl font-bold text-white tracking-tight">People</h1>
            
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <form action="/people" method="GET" className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="q"
                  defaultValue={q || ""}
                  className="block w-full pl-11 pr-4 py-3 border border-white/10 rounded-xl bg-surface-dark/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Search for person by ID (e.g. nm0000199)..."
                />
                <button type="submit" className="hidden">Search</button>
              </form>
              
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-dark/80 hover:bg-surface-dark border border-white/10 rounded-xl text-white transition-colors whitespace-nowrap">
                <Filter className="h-5 w-5" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="space-y-6">
            {q && error && (
              <div className="text-center py-12">
                <p className="text-red-400 text-lg">{error}</p>
              </div>
            )}

            {q && searchedPerson && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Search Result</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  <Link href={`/people/${searchedPerson.personId}`} className="group flex flex-col gap-3">
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-elevated/50">
                      <div className="absolute inset-0 flex items-center justify-center bg-surface-dark">
                        <UserRound className="h-12 w-12 text-gray-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/90 via-surface-dark/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    
                    <div className="flex flex-col text-center">
                      <h3 className="truncate font-medium text-white group-hover:text-primary-400 transition-colors">
                        {searchedPerson.primaryName}
                      </h3>
                      <p className="text-sm text-text-muted-dark truncate">
                        {searchedPerson.primaryProfession?.join(", ")}
                      </p>
                    </div>
                  </Link>
                </div>
              </>
            )}

            {!q && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Popular People</h2>
                  <span className="text-sm text-gray-400">Showing 8 results</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {mockPeople.map((person) => (
                    <Link key={person.id} href={`/people/${person.id}`} className="group flex flex-col gap-3">
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-elevated/50">
                        {person.imageUrl ? (
                          <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                            style={{ backgroundImage: `url(${person.imageUrl})` }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-surface-dark">
                            <UserRound className="h-12 w-12 text-gray-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/90 via-surface-dark/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        
                        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-surface-dark/80 px-2 py-1 backdrop-blur-md border border-white/10">
                          <Star className="h-3 w-3 fill-primary-500 text-primary-500" />
                          <span className="text-xs font-medium text-white">{person.popularity.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col text-center">
                        <h3 className="truncate font-medium text-white group-hover:text-primary-400 transition-colors">
                          {person.name}
                        </h3>
                        <p className="text-sm text-text-muted-dark">{person.knownFor}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
