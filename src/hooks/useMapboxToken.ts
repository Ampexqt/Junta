import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

export function useMapboxToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchToken() {
      // 1. Try to get from Cache (localStorage) first
      const cachedToken = localStorage.getItem('mapbox_token');
      const cacheTimestamp = localStorage.getItem('mapbox_token_ts');
      
      // If we have a cached token that is less than 24 hours old, use it
      const isCacheValid = cachedToken && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp) < 24 * 60 * 60 * 1000);

      if (isCacheValid) {
        setToken(cachedToken);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/config/mapbox`);
        if (!response.ok) {
          throw new Error('Failed to fetch Mapbox token');
        }
        const data = await response.json();
        
        // 2. Cache the new token
        localStorage.setItem('mapbox_token', data.token);
        localStorage.setItem('mapbox_token_ts', Date.now().toString());
        
        setToken(data.token);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching Mapbox token:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  return { token, loading, error };
}
