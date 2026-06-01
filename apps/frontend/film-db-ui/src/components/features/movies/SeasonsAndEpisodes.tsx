"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Calendar, ChevronRight, Tv, Loader2 } from "lucide-react";
import { tvSeriesApi } from "@/lib/api-client";
import { EpisodeInfoDto } from "@/types/imdb";

interface SeasonsAndEpisodesProps {
  movieId: string;
  seasonsCount: number;
}

export function SeasonsAndEpisodes({ movieId, seasonsCount }: SeasonsAndEpisodesProps) {
  const [activeSeason, setActiveSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<EpisodeInfoDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (movieId && activeSeason) {
      fetchEpisodes(activeSeason);
    }
  }, [movieId, activeSeason]);

  const fetchEpisodes = async (seasonNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await tvSeriesApi.getEpisodes(movieId, seasonNum);
      // Sort episodes by episode number just in case
      const sorted = [...data].sort((a, b) => a.episodeNumber - b.episodeNumber);
      setEpisodes(sorted);
    } catch (err: any) {
      console.error("Failed to fetch episodes", err);
      setError("Failed to load episodes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to render skeletons while loading
  const renderSkeletons = () => {
    return Array.from({ length: 4 }).map((_, idx) => (
      <div
        key={idx}
        className="w-full flex items-center justify-between p-5 rounded-none bg-black/20 border border-white/15 animate-pulse"
      >
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-white/10 rounded-none w-16" />
          <div className="h-6 bg-white/10 rounded-none w-2/3" />
          <div className="flex gap-4">
            <div className="h-4 bg-white/10 rounded-none w-20" />
            <div className="h-4 bg-white/10 rounded-none w-24" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-none bg-white/5 border border-white/10" />
      </div>
    ));
  };

  return (
    <section className="space-y-8 bg-black/20 border border-white/10 rounded-none p-6 md:p-8 backdrop-blur-md font-mono text-xs">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="p-3 bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20 rounded-none">
          <Tv className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white font-display uppercase tracking-widest">// SEASONS_AND_EPISODES</h2>
          <p className="text-[11px] text-text-muted-dark mt-0.5">Explore episodes of this TV series</p>
        </div>
      </div>

      {/* Season Selector */}
      <div className="space-y-3">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted-dark">// SELECT_SEASON</label>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {Array.from({ length: seasonsCount }).map((_, idx) => {
            const seasonNum = idx + 1;
            const isActive = activeSeason === seasonNum;
            return (
              <button
                key={seasonNum}
                onClick={() => setActiveSeason(seasonNum)}
                className={`px-5 py-2.5 rounded-none text-xs font-bold font-mono whitespace-nowrap transition-all duration-300 uppercase cursor-pointer border ${
                  isActive
                    ? "bg-cyan-accent border-cyan-accent text-surface-dark font-black shadow-[0_0_8px_rgba(85,234,212,0.3)]"
                    : "bg-black/40 border-white/5 hover:border-cyan-accent/20 text-text-muted-dark hover:text-white"
                }`}
              >
                Season {seasonNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* Episodes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">{renderSkeletons()}</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-none bg-red-accent/10 border border-red-accent/20 text-center">
            <p className="text-red-accent font-medium">// SYSTEM_ERROR: {error}</p>
            <button
              onClick={() => fetchEpisodes(activeSeason)}
              className="mt-4 px-4 py-2 border border-red-accent bg-red-accent text-white rounded-none text-xs font-semibold hover:bg-transparent hover:text-red-accent transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : episodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-none bg-black/20 border border-white/10 text-center">
            <p className="text-text-muted-dark">// SYSTEM_LOG: NO_EPISODES_FOUND FOR_SEASON {activeSeason}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {episodes.map((episode) => (
              <Link
                key={episode.episodeId}
                href={`/movies/${episode.episodeId}`}
                className="group flex items-center justify-between p-5 rounded-none bg-black/40 hover:bg-white/5 border border-white/10 hover:border-cyan-accent/40 transition-all duration-300 shadow-sm hover:shadow-[0_0_12px_rgba(85,234,212,0.05)]"
              >
                <div className="flex-1 space-y-1.5 pr-4">
                  {/* Episode Number Badge */}
                  <span className="inline-block px-2.5 py-0.5 bg-cyan-accent/5 text-cyan-accent border border-cyan-accent/25 rounded-none text-[10px] font-semibold mb-1 uppercase tracking-wider">
                    Episode {episode.episodeNumber}
                  </span>
                  
                  {/* Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-accent transition-colors font-mono uppercase tracking-wider">
                    {episode.primaryTitle || "Untitled Episode"}
                  </h3>
                  
                  {/* Original Title (if different) */}
                  {episode.originalTitle && episode.originalTitle !== episode.primaryTitle && (
                    <p className="text-xs text-text-muted-dark italic mt-0.5">
                      // {episode.originalTitle}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-text-muted-dark pt-1 font-mono uppercase">
                    {episode.startYear && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{episode.startYear}</span>
                      </div>
                    )}
                    {episode.runtimeMinutes && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{episode.runtimeMinutes} min</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow Action */}
                <div className="p-2 border border-white/10 group-hover:border-cyan-accent/25 bg-black/40 group-hover:bg-cyan-accent/10 text-text-muted-dark group-hover:text-cyan-accent rounded-none transition-all duration-300 transform group-hover:translate-x-1">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
