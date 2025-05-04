
import { useState, useEffect } from 'react';

export type MapProvider = 'google' | 'mapbox';

export const useMapProvider = () => {
  const [mapProvider, setMapProvider] = useState<MapProvider>(() => {
    // Try to get saved preference from localStorage
    const saved = localStorage.getItem('preferred-map-provider');
    return (saved as MapProvider) || 'google';
  });
  
  // Store preference in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('preferred-map-provider', mapProvider);
  }, [mapProvider]);
  
  // Check if the provider's API key is available
  const googleApiKeyAvailable = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapboxApiKeyAvailable = true; // Mapbox uses a default token if none provided
  
  // Toggle between map providers
  const toggleMapProvider = () => {
    setMapProvider(prev => prev === 'google' ? 'mapbox' : 'google');
  };
  
  return {
    mapProvider,
    setMapProvider,
    toggleMapProvider,
    googleApiKeyAvailable,
    mapboxApiKeyAvailable
  };
};
