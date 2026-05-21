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
        className="w-full flex items-center justify-between p-5 rounded-2xl bg-surface-dark/40 border border-white/5 animate-pulse"
      >
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-white/10 rounded w-16" />
          <div className="h-6 bg-white/10 rounded w-2/3" />
          <div className="flex gap-4">
            <div className="h-4 bg-white/10 rounded w-20" />
            <div className="h-4 bg-white/10 rounded w-24" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5" />
      </div>
    ));
  };

  return (
    <section className="space-y-8 bg-surface-dark/30 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <div className="p-3 bg-primary-600/10 text-primary-400 border border-primary-500/20 rounded-2xl">
          <Tv className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Seasons & Episodes</h2>
          <p className="text-sm text-gray-400 mt-0.5">Explore episodes of this TV series</p>
        </div>
      </div>

      {/* Season Selector */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Select Season</label>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {Array.from({ length: seasonsCount }).map((_, idx) => {
            const seasonNum = idx + 1;
            const isActive = activeSeason === seasonNum;
            return (
              <button
                key={seasonNum}
                onClick={() => setActiveSeason(seasonNum)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 transform active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20 scale-105"
                    : "bg-surface-dark/50 border border-white/5 hover:bg-surface-dark text-gray-400 hover:text-white"
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
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-red-400 font-medium">{error}</p>
            <button
              onClick={() => fetchEpisodes(activeSeason)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : episodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-surface-dark/20 border border-white/5 text-center">
            <p className="text-gray-400">No episodes found for Season {activeSeason}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {episodes.map((episode) => (
              <Link
                key={episode.episodeId}
                href={`/movies/${episode.episodeId}`}
                className="group flex items-center justify-between p-5 rounded-2xl bg-surface-dark/50 hover:bg-surface-dark border border-white/5 hover:border-primary-500/20 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-primary-500/5 transform hover:-translate-y-0.5"
              >
                <div className="flex-1 space-y-1.5 pr-4">
                  {/* Episode Number Badge */}
                  <span className="inline-block px-2.5 py-0.5 bg-primary-600/10 text-primary-400 border border-primary-500/20 rounded-md text-xs font-semibold mb-1">
                    Episode {episode.episodeNumber}
                  </span>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                    {episode.primaryTitle || "Untitled Episode"}
                  </h3>
                  
                  {/* Original Title (if different) */}
                  {episode.originalTitle && episode.originalTitle !== episode.primaryTitle && (
                    <p className="text-sm text-gray-400 italic mt-0.5">
                      {episode.originalTitle}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
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
                <div className="p-2.5 rounded-full bg-white/5 group-hover:bg-primary-600/20 text-gray-400 group-hover:text-primary-400 border border-transparent group-hover:border-primary-500/20 transition-all duration-300 transform group-hover:translate-x-1">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
