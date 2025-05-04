
import { useState, useCallback } from 'react';
import { Venue } from '@/types';
import { PlacesService } from '@/services/places';
import { SEARCH_RADIUS } from '@/services/places/config';
import mockData from '../mock_data.json';

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
        setVenues(response.venues);
        setNextPageToken(response.nextPageToken || null);
        setUsingMockData(false);
      }
    } catch (error) {
      console.error('Failed to search nearby venues:', error);
      setError('Failed to load venues. Using mock data instead.');
      
      // Use mock data as fallback
      if (useMockData || true) { // Always use mock data on error for now
        console.log('Using mock data for venues');
        const mockVenues = mockData.venues.map(venue => ({
          ...venue,
          coordinates: {
            lat: venue.coordinates.lat + (Math.random() - 0.5) * 0.01,
            lng: venue.coordinates.lng + (Math.random() - 0.5) * 0.01
          }
        }));
        setVenues(mockVenues);
        setUsingMockData(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);
  
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
