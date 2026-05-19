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
    <section className="mt-8">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 bg-surface-dark/50 border border-white/5 rounded-xl hover:bg-surface-dark/70 transition-colors"
      >
        <span className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-500" />
          Supplementary Info
        </span>
        {loading ? (
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        ) : isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 p-6 bg-surface-dark/50 border border-white/5 rounded-2xl overflow-hidden">
          {error && <p className="text-red-400">{error}</p>}
          {!loading && !error && data?.localizedTitles && data.localizedTitles.length > 0 ? (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Localized Titles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.localizedTitles.map((titleInfo, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      {titleInfo.language} {titleInfo.region ? `(${titleInfo.region})` : ""}
                    </span>
                    <span className="text-gray-200">{titleInfo.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : !loading && !error && data ? (
            <p className="text-gray-400">No supplementary info available.</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
