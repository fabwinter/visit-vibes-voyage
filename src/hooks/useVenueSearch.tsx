
import { useState, useCallback } from 'react';
import { Venue } from '@/types';
import { nearbySearch } from '@/services/places/placesService';
import { FOOD_PLACE_TYPES, SEARCH_RADIUS } from '@/services/places/config';
import mockData from '../mock_data.json';

// Map Google Places API results to our Venue type
const mapResponseToVenues = (results: google.maps.places.PlaceResult[]): Venue[] => {
  return results.map(place => {
    const photoUrls = place.photos ? place.photos.map(photo => photo.getUrl({ maxWidth: 500, maxHeight: 500 })) : [];

    return {
      id: place.place_id || 'unknown',
      name: place.name || 'Unknown',
      address: place.formatted_address || 'No Address',
      coordinates: {
        lat: place.geometry?.location?.lat() || 0,
        lng: place.geometry?.location?.lng() || 0
      },
      photos: photoUrls,
      website: place.website || undefined,
      hours: place.opening_hours?.weekday_text?.join('\n') || undefined,
      phoneNumber: place.formatted_phone_number || undefined,
      priceLevel: place.price_level || undefined,
      category: place.types || [],
      googleRating: place.rating || undefined,
      inWishlist: false,
      wishlistTags: [],
      wishlistCategory: ''
    };
  });
};

const useMockData = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const useVenueSearch = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  
  // Function to search nearby venues
  const searchNearbyVenues = useCallback(async (location: google.maps.LatLngLiteral) => {
    setIsLoading(true);
    
    try {
      const response = await nearbySearch({
        location: location,
        radius: SEARCH_RADIUS,
        types: FOOD_PLACE_TYPES,
        pageToken: null
      });
      
      if (response.results) {
        const newVenues = mapResponseToVenues(response.results);
        setVenues(newVenues);
        setNextPageToken(response.next_page_token || null);
      }
    } catch (error) {
      console.error('Failed to search nearby venues:', error);
      
      // If real API fails, use mock data
      if (useMockData) {
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
  const handleLoadMore = useCallback(async (userLocation: google.maps.LatLngLiteral) => {
    if (!nextPageToken) return;

    setIsLoading(true);
    try {
      const response = await nearbySearch({
        location: userLocation,
        radius: SEARCH_RADIUS,
        types: FOOD_PLACE_TYPES,
        pageToken: nextPageToken
      });

      if (response.results) {
        const newVenues = mapResponseToVenues(response.results);
        setVenues(prevVenues => [...prevVenues, ...newVenues]);
        setNextPageToken(response.next_page_token || null);
      }
    } catch (error) {
      console.error('Failed to load more venues:', error);
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
    searchNearbyVenues,
    handleLoadMore
  };
};
