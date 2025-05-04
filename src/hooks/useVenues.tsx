
import { useState, useEffect, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useLocationState } from './useLocationState';
import { useVenueSearch } from './useVenueSearch';
import { useSelectedVenue } from './useSelectedVenue';
import { toast } from 'sonner';
import { Venue } from '@/types';

// Specify the libraries for Google Maps
const libraries = ["places"] as ["places"];

export const useVenues = () => {
  const [pendingAction, setPendingAction] = useState<{type: string, venue: Venue} | null>(null);
  
  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries,
  });
  
  // Use our refactored hooks
  const locationState = useLocationState();
  const venueSearch = useVenueSearch();
  const selectedVenueState = useSelectedVenue(venueSearch.venues);
  
  // Load initial venues when the location or API changes
  useEffect(() => {
    if (!isLoaded) return;

    if (locationState.userLocation.lat && locationState.userLocation.lng) {
      venueSearch.searchNearbyVenues(locationState.userLocation);
    }
  }, [locationState.userLocation, isLoaded, venueSearch.searchNearbyVenues]);
  
  // Handle check-in with auth
  const handleCheckIn = useCallback((venue: Venue) => {
    // This is a stub - the actual logic is in the MapView component
    console.log('Check-in requested for venue:', venue.name);
  }, []);
  
  // Process check-in data
  const processCheckIn = useCallback((visit: any) => {
    // This is a placeholder for check-in processing
    console.log('Processing check-in:', visit);
    toast.success("Check-in successful!");
  }, []);

  return {
    // Location-related properties
    ...locationState,
    
    // Venues search-related properties
    ...venueSearch,
    
    // Selected venue-related properties
    ...selectedVenueState,
    
    // Google Maps API loading state
    isLoaded,
    
    // Additional state
    pendingAction,
    setPendingAction,
    
    // Check-in methods
    handleCheckIn,
    processCheckIn,
    
    // Convenience method to load more venues
    handleLoadMore: () => venueSearch.handleLoadMore(locationState.userLocation)
  };
};
