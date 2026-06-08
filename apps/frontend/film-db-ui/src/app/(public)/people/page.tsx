import { Search, Filter, Star, UserRound } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchApi } from "@/lib/api-server";
import { PersonInfo } from "@/types/imdb";



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
          <div className="flex flex-col gap-6 mb-12 p-6 md:p-8 bg-surface-elevated-dark/30 border border-white/10 relative overflow-hidden">
            {/* Cyberpunk corner decorations */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-accent"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-accent"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-accent"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-accent"></div>

            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mt-2">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold font-display uppercase tracking-widest text-white flex items-center gap-1">
                  // PEOPLE
                </h1>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
              <form action="/people" method="GET" className="relative flex-grow flex flex-col sm:flex-row items-stretch sm:items-center terminal-border bg-surface-dark/60">
                <div className="relative flex-grow flex items-center w-full">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-cyan-accent/80" />
                  </div>
                  <input
                    type="text"
                    name="q"
                    defaultValue={q || ""}
                    className="block w-full pl-12 pr-4 sm:pr-32 py-4 bg-transparent text-white font-mono text-sm uppercase placeholder-gray-600 focus:outline-none border-none"
                    placeholder="> ENTER PERSON ID (E.G. NM0000199)..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto sm:absolute right-3 px-5 py-3 sm:py-2 bg-cyan-accent/10 border-t sm:border border-white/10 sm:border-cyan-accent/40 text-cyan-accent hover:bg-cyan-accent hover:text-black hover:border-cyan-accent text-xs font-mono font-bold uppercase rounded-none transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span className="whitespace-nowrap">[ SEARCH ]</span>
                </button>
              </form>
              
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-surface-dark/90 border border-white/10 text-white/80 hover:border-cyan-accent/50 hover:text-cyan-accent hover:shadow-[0_0_8px_rgba(85,234,212,0.15)] rounded-none text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer">
                <Filter className="h-3.5 w-3.5" />
                <span>[ FILTER ]</span>
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
                  <h2 className="text-xl font-bold font-display uppercase tracking-wider text-white">Search Result</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  <Link href={`/people/${searchedPerson.personId}`} className="group flex flex-col border border-white/10 p-2 bg-surface-elevated-dark hover:border-cyan-accent hover:translate-y-[-2px] transition-all duration-150 rounded-none shadow-md">
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-surface-dark border border-white/5">
                      <div className="absolute inset-0 flex items-center justify-center bg-surface-dark">
                        <UserRound className="h-12 w-12 text-gray-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/90 via-surface-dark/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    
                    <div className="flex flex-col mt-2 pt-1 border-t border-white/[0.03]">
                      <h3 className="font-display text-sm font-bold tracking-widest text-white uppercase group-hover:text-cyan-accent transition-colors truncate">
                        {searchedPerson.primaryName}
                      </h3>
                      <p className="text-xs font-display text-text-muted-dark uppercase mt-1 truncate">
                        {searchedPerson.primaryProfession?.join(", ")}
                      </p>
                    </div>
                  </Link>
                </div>
              </>
            )}

            {!q && (
              <div className="flex flex-col items-center justify-center py-24 border border-white/10 bg-surface-elevated-dark p-8 rounded-none">
                <div className="font-mono text-sm text-cyan-accent uppercase mb-3 tracking-widest flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 bg-cyan-accent/80 animate-ping rounded-none" />
                  <span>&gt; SYSTEM STATE: IDLE // AWAITING_INPUT</span>
                </div>
                <div className="font-mono text-xs text-text-muted-dark uppercase tracking-widest text-center max-w-md leading-relaxed">
                  [!] RETRIEVAL MODULE STANDBY. ENTER A VALID IMDB PERSON ID (E.G. NM0000199) IN THE TERMINAL INPUT ABOVE TO INITIATE INTEL QUERY.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
