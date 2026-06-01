"use client";

import { useState } from "react";
import { Globe, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { MovieSupplementaryInfo } from "@/types/imdb";

export function MovieSupplementaryInfoSection({ movieId }: { movieId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MovieSupplementaryInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    if (!isOpen && !data && !loading) {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/api/v1/imdb/film/alternative/${encodeURIComponent(movieId)}`);
        setData(response.data);
      } catch (err) {
        setError("Failed to load supplementary info.");
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <section className="mt-8 font-mono text-xs">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-none hover:bg-white/5 transition-all cursor-pointer hover:border-cyan-accent/20"
      >
        <span className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
          <Globe className="w-4 h-4 text-cyan-accent" />
          // SUPPLEMENTARY_INFO
        </span>
        {loading ? (
          <Loader2 className="w-4 h-4 text-cyan-accent animate-spin" />
        ) : isOpen ? (
          <ChevronUp className="w-4 h-4 text-cyan-accent" />
        ) : (
          <ChevronDown className="w-4 h-4 text-cyan-accent" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 p-6 bg-black/20 border border-white/10 rounded-none">
          {error && <p className="text-red-accent">// SYSTEM_ERROR: {error}</p>}
          {!loading && !error && data?.localizedTitles && data.localizedTitles.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">// LOCALIZED_TITLES</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.localizedTitles.map((titleInfo, index) => (
                  <div key={index} className="flex flex-col bg-black/30 p-3 border border-white/5">
                    <span className="text-[10px] text-text-muted-dark uppercase tracking-wider mb-1">
                      {titleInfo.language} {titleInfo.region ? `(${titleInfo.region})` : ""}
                    </span>
                    <span className="text-gray-200 text-xs font-bold">{titleInfo.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : !loading && !error && data ? (
            <p className="text-text-muted-dark">// SYSTEM_LOG: NO SUPPLEMENTARY DETAILS RESOLVED</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
