
import { useState, useCallback, useEffect } from 'react';
import { Venue } from '@/types';
import { PlacesService } from '@/services/places';
import { SEARCH_RADIUS } from '@/services/places/config';
import mockData from '../mock_data.json';
import { toast } from 'sonner';
import { useMapProvider } from './useMapProvider';

// Use mock data flag for development
const useDevelopmentMockData = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const useVenueSearch = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { mapProvider } = useMapProvider();
  
  // Reset venues when map provider changes
  useEffect(() => {
    setVenues([]);
    setNextPageToken(null);
    setError(null);
    setUsingMockData(false);
  }, [mapProvider]);
  
  // Function to search nearby venues
  const searchNearbyVenues = useCallback(async (location: {lat: number, lng: number}) => {
    // Skip if location is not valid
    if (!location.lat || !location.lng) {
      console.warn('Invalid location provided to searchNearbyVenues');
      return;
    }

    console.log('Searching venues near', location, 'using', mapProvider);
    setIsLoading(true);
    setError(null);
    
    try {
      // Only try to use the Places API if using Google as provider
      if (mapProvider === 'google') {
        const response = await PlacesService.searchNearbyVenues({
          location,
          radius: SEARCH_RADIUS,
          type: 'restaurant'
        });
        
        if (response.venues && response.venues.length > 0) {
          console.log(`Found ${response.venues.length} venues from Places API`);
          setVenues(response.venues);
          setNextPageToken(response.nextPageToken || null);
          setUsingMockData(false);
          setRetryCount(0); // Reset retry count on success
          return;
        }
        
        // If using Google but no venues were returned, try again with a more generic query
        if (retryCount === 0) {
          setRetryCount(1);
          const retryResponse = await PlacesService.searchNearbyVenues({
            location,
            radius: SEARCH_RADIUS * 1.5, // Expand search radius by 50%
            type: 'establishment', // More generic type
          });
          
          if (retryResponse.venues && retryResponse.venues.length > 0) {
            console.log(`Found ${retryResponse.venues.length} venues from Places API on retry`);
            setVenues(retryResponse.venues);
            setNextPageToken(retryResponse.nextPageToken || null);
            setUsingMockData(false);
            setRetryCount(0); // Reset retry count
            return;
          }
        }
      }
      
      // If we reach here, either:
      // 1. We're using Mapbox, or
      // 2. Google search returned no results even after retry
      console.warn('No venues found with real API. Using mock data.');
      toast.info("No venues found in this area. Using mock data instead.");
      
      useMockFallback(location);
    } catch (error) {
      console.error('Failed to search nearby venues:', error);
      toast.error('Failed to load venues. Using mock data instead.');
      
      useMockFallback(location);
    } finally {
      setIsLoading(false);
    }
  }, [mapProvider, retryCount]);
  
  // Function to use mock data as fallback
  const useMockFallback = (location: {lat: number, lng: number}) => {
    // Use mock data as fallback
    if (useDevelopmentMockData || true) { // Always use mock data on error for now
      console.log('Using mock data for venues');
      const mockVenues = mockData.venues.map(venue => ({
        ...venue,
        coordinates: {
          lat: location.lat + (Math.random() - 0.5) * 0.01,
          lng: location.lng + (Math.random() - 0.5) * 0.01
        }
      }));
      setVenues(mockVenues);
      setUsingMockData(true);
    }
  };
  
  // Load more venues with pagination
  const handleLoadMore = useCallback(async (userLocation: {lat: number, lng: number}) => {
    if (!nextPageToken) return;

    setIsLoading(true);
    try {
      const response = await PlacesService.searchNearbyVenues({
        location: userLocation,
        radius: SEARCH_RADIUS,
        type: 'restaurant',
        pageToken: nextPageToken
      });

      if (response.venues) {
        setVenues(prevVenues => [...prevVenues, ...response.venues]);
        setNextPageToken(response.nextPageToken || null);
      }
    } catch (error) {
      console.error('Failed to load more venues:', error);
      setError('Failed to load more venues.');
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, [nextPageToken, mapProvider]);
  
  return {
    venues,
    setVenues,
    isLoading,
    usingMockData,
    nextPageToken,
    error,
    searchNearbyVenues,
    handleLoadMore
  };
};
