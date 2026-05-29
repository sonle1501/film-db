import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/lib/api-client';
import { MovieSearchResultDto } from '@/types/imdb';

export const useLiveSearch = (query: string, searchMode: 'smart' | 'vn' = 'smart', limit = 5) => {
  const trimmedQuery = query.trim();

  return useQuery<MovieSearchResultDto[]>({
    queryKey: ['live-search', trimmedQuery, searchMode, limit],
    queryFn: async ({ signal }) => {
      if (searchMode === 'vn') {
        return searchApi.liveSearchVietnamese(trimmedQuery, limit, signal);
      } else {
        return searchApi.liveSearchSmart(trimmedQuery, limit, signal);
      }
    },
    enabled: trimmedQuery.length > 0,
    staleTime: 60 * 1000, // Cache results for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in garbage collector for 5 minutes
  });
};
