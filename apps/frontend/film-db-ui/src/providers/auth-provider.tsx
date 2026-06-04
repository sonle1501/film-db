'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';
import { authApi } from '@/lib/api-client';

// Simple function to parse payload from JWT token
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setAuth, setInitializing } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // If we already have a token in memory (e.g. from redirect or manual login), complete initialization
      if (token) {
        setInitializing(false);
        return;
      }

      try {
        // Attempt to refresh the access token using the HTTP-only cookie
        const response = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        const { token: newToken } = response.data;

        if (newToken) {
          // Decode the token to get the username (subject)
          const claims = parseJwt(newToken);
          const username = claims?.sub;

          if (username) {
            // Fetch the user's profile metadata using the new token
            const profile = await authApi.getProfile(username, newToken);
            setAuth(newToken, profile);
          } else {
            setInitializing(false);
          }
        } else {
          setInitializing(false);
        }
      } catch (error) {
        // No active session or refresh failed, which is normal for guests/first loads
        setInitializing(false);
      }
    };

    initializeAuth();
  }, [token, setAuth, setInitializing]);

  return <>{children}</>;
}