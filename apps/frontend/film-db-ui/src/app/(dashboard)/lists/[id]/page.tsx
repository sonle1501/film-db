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
            const data = await movieApi.getMovieById(item.movieId);
            return {
              id: data.movieId,
              title: data.primaryTitle || "Unknown Title",
              year: data.startYear || new Date().getFullYear(),
              rating: data.averageRating || 0,
              imageUrl: getMoviePosterUrl(data.imageUrl),
              genre: (data.genres && data.genres.length > 0) ? data.genres[0] : "Unknown",
            };
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
      <div className="text-red-500 py-12 text-center bg-red-500/10 rounded-xl border border-red-500/20">
        <p>Failed to load list details. Please ensure you are logged in and have access to this list.</p>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">
          {listDetails ? listDetails.nameList : 'List Details'}
        </h1>
        {listDetails && (
          <div className="flex gap-4 text-sm text-text-muted-dark">
            <span className="bg-surface-dark/50 px-2 py-1 rounded border border-white/10">{listDetails.listType}</span>
            <span className="bg-surface-dark/50 px-2 py-1 rounded border border-white/10">{listDetails.isPublic ? 'Public' : 'Private'}</span>
            <span className="bg-surface-dark/50 px-2 py-1 rounded border border-white/10">{listItems.length} items</span>
          </div>
        )}
      </div>

      {listItems.length === 0 ? (
        <div className="py-12 text-center text-text-muted-dark bg-surface-dark/30 rounded-xl border border-white/5 border-dashed">
          <p className="text-lg">This list is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {listItems.map((item) => {
            const movie = movies.find(m => m.id === item.movieId);
            if (!movie) return null;
            
            return (
              <div key={item.movieId} className="flex flex-col gap-2">
                <MovieCard movie={movie} />
                <div className="bg-surface-dark/50 p-3 rounded-lg border border-white/5 text-sm mt-2 flex-grow flex flex-col group/item">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-primary-400 text-xs">{item.state.replace(/_/g, ' ')}</span>
                    <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="text-gray-400 hover:text-white"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm('Are you sure you want to remove this movie from the list?')) {
                            deleteListItem({ listId: id, itemId: item.itemId });
                          }
                        }}
                        className="text-gray-400 hover:text-red-400"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {item.notes && (
                    <p className="text-text-muted-dark text-xs italic line-clamp-2" title={item.notes}>
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
