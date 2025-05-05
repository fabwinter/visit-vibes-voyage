
import { useState, useCallback } from 'react';
import { Venue } from '@/types';
import { PlacesService } from '@/services/places';
import { SEARCH_RADIUS } from '@/services/places/config';
import mockData from '../mock_data.json';
import { toast } from 'sonner';

// Use mock data flag for development
const useMockData = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const useVenueSearch = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Function to search nearby venues
  const searchNearbyVenues = useCallback(async (location: {lat: number, lng: number}) => {
    // Skip if location is not valid
    if (!location.lat || !location.lng) {
      console.warn('Invalid location provided to searchNearbyVenues');
      return;
    }

    console.log('Searching venues near', location);
    setIsLoading(true);
    setError(null);
    
    try {
      // Using the restructured PlacesService from services/places/index.ts
      const response = await PlacesService.searchNearbyVenues({
        location,
        radius: SEARCH_RADIUS,
        type: 'restaurant'
      });
      
      if (response.venues) {
        console.log(`Found ${response.venues.length} venues from Places API`);
        setVenues(response.venues);
        setNextPageToken(response.nextPageToken || null);
        setUsingMockData(false);
      } else {
        // If no venues were returned but API call was successful
        console.warn('No venues returned from Places API');
        toast.info("No venues found in this area. Using mock data instead.");
        useMockFallback(location);
      }
    } catch (error) {
      console.error('Failed to search nearby venues:', error);
      toast.error('Failed to load venues. Using mock data instead.');
      
      useMockFallback(location);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Function to use mock data as fallback
  const useMockFallback = (location: {lat: number, lng: number}) => {
    // Use mock data as fallback
    if (useMockData || true) { // Always use mock data on error for now
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
  }, [nextPageToken]);
  
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
