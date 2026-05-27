import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { EpisodeInfoDto, MovieSearchResultDto, Page } from '@/types/imdb';

// Determine the base URL depending on the environment
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: '',  // fix CORS
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies when cross-domain requests
});

// Request interceptor to attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 and refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the refresh endpoint
        const response = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const { token } = response.data;
        
        // Update the store with the new token
        useAuthStore.getState().setToken(token);

        // Update the Authorization header and retry the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log the user out
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (data: any) => {
    const res = await apiClient.post('/api/auth/login', data);
    return res.data;
  },
  register: async (data: any) => {
    const res = await apiClient.post('/api/auth/register', data);
    return res.data;
  },
  registerAdmin: async (data: any) => {
    const res = await apiClient.post('/api/auth/register/admin', data);
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/api/auth/logout');
    return res.data;
  },
getProfile: async (username: string, token?: string) => {
    const config: any = { params: { username } };
    
    // Explicitly set the header if the token is provided mid-flight
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    
    const res = await apiClient.get('/api/v1/user/profile', config);
    return res.data;
  }
};

export const movieApi = {
  getMovieById: async (id: string) => {
    const res = await apiClient.get(`/api/v1/imdb/film/${encodeURIComponent(id)}`);
    return res.data;
  },
  getMoviesByName: async (name: string) => {
    const res = await apiClient.get('/api/v1/imdb/listfilm/by-name', {
      params: { name }
    });
    return res.data;
  },
  getTopRatedMovies: async () => {
    const res = await apiClient.get('/api/v1/imdb/listfilm/top-rated-movies');
    return res.data;
  },
  getTopRatedTvSeries: async () => {
    const res = await apiClient.get('/api/v1/imdb/listfilm/top-rated-tvseries');
    return res.data;
  },
  getPopularMovies: async () => {
    const res = await apiClient.get('/api/v1/imdb/listfilm/popular-movies');
    return res.data;
  },
  filterMovies: async (filters: { startYear?: number | null; averageRating?: number | null; numVotes?: number | null; titleType?: string | null; genre?: string | null }, page = 0, size = 10) => {
    const res = await apiClient.patch('/api/v1/imdb/listfilm/filter', filters, {
      params: { page, size }
    });
    return res.data;
  },
  filterMoviesExactYear: async (filters: { startYear?: number | null; averageRating?: number | null; numVotes?: number | null; titleType?: string | null; genre?: string | null }, page = 0, size = 10) => {
    const res = await apiClient.patch('/api/v1/imdb/listfilm/filter-year', filters, {
      params: { page, size }
    });
    return res.data;
  },
  filterAndSortMovies: async (
    filters: { 
      startYear?: number | null; 
      averageRating?: number | null; 
      numVotes?: number | null; 
      titleType?: string | null;
      genre?: string | null;
      sortBy: string;
      sortDirection: string;
    }, 
    page = 0, 
    size = 10
  ) => {
    const res = await apiClient.patch('/api/v1/imdb/listfilm/filter/sort', filters, {
      params: { page, size }
    });
    return res.data;
  },
  filterAndSortMoviesExactYear: async (
    filters: { 
      startYear?: number | null; 
      averageRating?: number | null; 
      numVotes?: number | null; 
      titleType?: string | null;
      genre?: string | null;
      sortBy: string;
      sortDirection: string;
    }, 
    page = 0, 
    size = 10
  ) => {
    const res = await apiClient.patch('/api/v1/imdb/listfilm/filter-year/sort', filters, {
      params: { page, size }
    });
    return res.data;
  },
  getGenres: async () => {
    const res = await apiClient.get('/api/v1/imdb/genres');
    return res.data;
  },
  getMoviesByGenre: async (genre: string, page = 0, size = 20) => {
    const res = await apiClient.get('/api/v1/imdb/listfilm/by-genre', {
      params: { genre, page, size }
    });
    return res.data;
  }
};

export const userApi = {
  getProfile: async (username: string) => {
    const res = await apiClient.get('/api/v1/user/profile', {
      params: { username }
    });
    return res.data;
  },
  getLists: async () => {
    const res = await apiClient.get('/api/v1/users/lists/all');
    return res.data;
  },
  getListById: async (listId: string) => {
    const res = await apiClient.get(`/api/v1/users/lists/${listId}`);
    return res.data;
  },
  getListItems: async (listId: string) => {
    const res = await apiClient.get(`/api/v1/users/lists/${listId}/items`);
    return res.data;
  },
  createList: async (data: { nameList: string; type: string; isPublic: boolean }) => {
    const res = await apiClient.post('/api/v1/users/lists', data);
    return res.data;
  },
  updateList: async (data: { userId: string; listId: string; nameList: string; isPublic: boolean; isCustom: boolean; listType: string }) => {
    const res = await apiClient.patch('/api/v1/users/lists', data);
    return res.data;
  },
  deleteList: async (listId: string) => {
    const res = await apiClient.delete(`/api/v1/users/lists/${listId}`);
    return res.data;
  },
  addListItem: async (listId: string, data: { movieId: string; state: string; notes?: string }) => {
    const res = await apiClient.post(`/api/v1/users/lists/${listId}/item`, data);
    return res.data;
  },
  updateListItem: async (listId: string, data: { itemId: string; state?: string; notes?: string }) => {
    const res = await apiClient.patch(`/api/v1/users/lists/${listId}/item`, data);
    return res.data;
  },
  getListItem: async (listId: string, itemId: string) => {
    const res = await apiClient.get(`/api/v1/users/lists/${listId}/item/${itemId}`);
    return res.data;
  },
  deleteListItem: async (listId: string, itemId: string) => {
    const res = await apiClient.delete(`/api/v1/users/lists/${listId}/item/${itemId}`);
    return res.data;
  },
  updateUsername: async (data: any) => {
    const res = await apiClient.put('/api/v1/user/profile/username', data);
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await apiClient.patch('/api/v1/user/profile', data);
    return res.data;
  },
  requestAdmin: async () => {
    const res = await apiClient.post('/api/v1/user/profile/request-admin');
    return res.data;
  }
};

export const adminApi = {
  getUserLists: async (userId: string) => {
    const res = await apiClient.get(`/api/admin/userlist/${userId}/lists`);
    return res.data;
  },
  getAllLists: async () => {
    const res = await apiClient.get('/api/admin/userlist/all-lists');
    return res.data;
  },
  getPendingTasks: async () => {
    const res = await apiClient.get('/api/admin/job/pending-tasks');
    return res.data;
  },
  approveAdmin: async (userId: string) => {
    const res = await apiClient.post('/api/admin/job/approve-admin', null, {
      params: { userId }
    });
    return res.data;
  },
  rejectAdmin: async (userId: string) => {
    const res = await apiClient.post('/api/admin/job/reject-admin', null, {
      params: { userId }
    });
    return res.data;
  },
  runImportPipeline: async () => {
    const res = await apiClient.post('/api/admin/import-pipeline/run');
    return res.data;
  },
  getImportStatus: async (jobId: string) => {
    const res = await apiClient.get('/api/admin/import-pipeline/status', {
      params: { jobId }
    });
    return res.data;
  },
  getImportHistory: async () => {
    const res = await apiClient.get('/api/admin/import-pipeline/history');
    return res.data;
  }
};

export const tvSeriesApi = {
  getSeasons: async (filmId: string): Promise<number> => {
    const res = await apiClient.get(`/api/v1/imdb/tvseries/${encodeURIComponent(filmId)}/seasons`);
    return res.data;
  },
  getEpisodes: async (filmId: string, season: number): Promise<EpisodeInfoDto[]> => {
    const res = await apiClient.get(`/api/v1/imdb/tvseries/${encodeURIComponent(filmId)}/episodes`, {
      params: { season }
    });
    return res.data;
  }
};

export const searchApi = {
  searchSmart: async (query: string, page = 0, size = 10): Promise<Page<MovieSearchResultDto>> => {
    const res = await apiClient.get('/api/v1/search', {
      params: { query, page, size }
    });
    return res.data;
  },
  liveSearchSmart: async (query: string, limit = 5): Promise<MovieSearchResultDto[]> => {
    const res = await apiClient.get('/api/v1/search/live', {
      params: { query, limit }
    });
    return res.data;
  },
  searchVietnamese: async (query: string, page = 0, size = 10): Promise<Page<MovieSearchResultDto>> => {
    const res = await apiClient.get('/api/v1/search/vn', {
      params: { query, page, size }
    });
    return res.data;
  },
  liveSearchVietnamese: async (query: string, limit = 5): Promise<MovieSearchResultDto[]> => {
    const res = await apiClient.get('/api/v1/search/vn/live', {
      params: { query, limit }
    });
    return res.data;
  }
};



