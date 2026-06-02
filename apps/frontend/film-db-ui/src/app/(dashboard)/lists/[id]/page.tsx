'use client';

import { useEffect, useState } from "react";
import { MovieCard, MovieProps } from "@/components/features/movies/MovieCard";
import { getMoviePosterUrl } from "@/lib/utils";
import { movieApi } from "@/lib/api-client";
import { Loader2, Edit2, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useListDetails, useListItems, useDeleteListItem } from "@/hooks/useLists";
import { EditListItemModal } from "@/components/features/movies/EditListItemModal";

export default function ListDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: listDetails, isLoading: isDetailsLoading, error: detailsError } = useListDetails(id);
  const { data: listItems = [], isLoading: isItemsLoading, error: itemsError } = useListItems(id);

  const [movies, setMovies] = useState<MovieProps[]>([]);
  const [isMoviesLoading, setIsMoviesLoading] = useState(false);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const { mutate: deleteListItem } = useDeleteListItem();

  useEffect(() => {
    const fetchMovies = async () => {
      if (!listItems || listItems.length === 0) {
        setMovies([]);
        return;
      }

      setIsMoviesLoading(true);
      try {
        const moviePromises = listItems.map(async (item) => {
          try {
            const data = await movieApi.getMovieFullById(item.movieId);
            const movieInfo: MovieProps = {
              id: data.movieId,
              title: data.primaryTitle || "Unknown Title",
              year: data.startYear || new Date().getFullYear(),
              rating: data.averageRating || 0,
              imageUrl: getMoviePosterUrl(data.imageUrl),
              genre: (data.genres && data.genres.length > 0) ? data.genres[0] : "Unknown",
              votes: data.numVotes,
            };
            return movieInfo;
          } catch {
            return null;
          }
        });
        const fetchedMovies = (await Promise.all(moviePromises)).filter((m): m is MovieProps => m !== null);
        setMovies(fetchedMovies);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      } finally {
        setIsMoviesLoading(false);
      }
    };

    if (!isItemsLoading) {
      fetchMovies();
    }
  }, [listItems, isItemsLoading]);

  const isLoading = isDetailsLoading || isItemsLoading || (listItems.length > 0 && isMoviesLoading && movies.length === 0);
  const error = detailsError || itemsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-accent py-12 text-center bg-red-accent/10 border border-red-accent/20 rounded-none font-mono">
        <p>SYSTEM_ERROR: FAILED_TO_LOAD_LIST_DETAILS. VERIFY AUTHORIZATION OR SESSION KEY.</p>
      </div>
    );
  }

  return (
    <div className="text-white font-mono">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2 uppercase tracking-widest">
          // LIST: {listDetails ? listDetails.nameList : 'DETAILS'}
        </h1>
        {listDetails && (
          <div className="flex flex-wrap gap-3 text-xs text-text-muted-dark mt-4">
            <span className="bg-black/40 px-2 py-0.5 border border-white/10 text-cyan-accent font-bold uppercase tracking-wider rounded-none">{listDetails.listType}</span>
            <span className="bg-black/40 px-2 py-0.5 border border-white/10 text-cyan-accent font-bold uppercase tracking-wider rounded-none">{listDetails.isPublic ? 'Public' : 'Private'}</span>
            <span className="bg-black/40 px-2 py-0.5 border border-white/10 text-yellow-accent font-bold uppercase tracking-wider rounded-none">{listItems.length} items</span>
          </div>
        )}
      </div>

      {listItems.length === 0 ? (
        <div className="py-12 text-center text-text-muted-dark bg-surface-dark/30 border border-white/10 border-dashed rounded-none">
          <p className="text-sm uppercase tracking-widest">// SYSTEM_LOG: THIS_LIST_IS_EMPTY</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listItems.map((item) => {
            const movie = movies.find(m => m.id === item.movieId);
            if (!movie) return null;
            
            return (
              <div key={item.movieId} className="flex flex-col gap-2">
                <MovieCard movie={movie} />
                <div className="bg-black/20 p-3 rounded-none border border-white/10 text-xs mt-2 flex-grow flex flex-col group/item">
                  <div className="flex justify-between items-center mb-2 pb-1 border-b border-white/5">
                    <span className="font-mono text-cyan-accent uppercase tracking-wider text-[10px]">{item.state.replace(/_/g, ' ')}</span>
                    <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="text-gray-400 hover:text-white cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm('Are you sure you want to remove this movie from the list?')) {
                            deleteListItem({ listId: id, itemId: item.itemId });
                          }
                        }}
                        className="text-gray-400 hover:text-red-accent cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {item.notes && (
                    <p className="text-text-muted-dark text-[11px] italic line-clamp-3 leading-relaxed" title={item.notes}>
                      &quot;{item.notes}&quot;
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingItem && listDetails && (
        <EditListItemModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          listId={id}
          item={editingItem}
          listType={listDetails.listType}
        />
      )}
    </div>
  );
}
