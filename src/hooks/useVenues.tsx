
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
  
  // Log when isLoaded state changes
  useEffect(() => {
    console.log("Google Maps API loaded:", isLoaded);
    console.log("API Key available:", !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  }, [isLoaded]);
  
  // Load initial venues when the location or API changes
  useEffect(() => {
    if (!isLoaded) return;

    if (locationState.userLocation.lat && locationState.userLocation.lng) {
      console.log("Loading venues with location:", locationState.userLocation);
      venueSearch.searchNearbyVenues(locationState.userLocation)
        .catch(error => {
          console.error("Failed to search venues:", error);
          toast.error("Failed to load venues. Using mock data instead.");
        });
    }
  }, [locationState.userLocation, isLoaded, venueSearch.searchNearbyVenues]);
  
  // Enhanced function to handle Google place selections
  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (!place || !place.geometry || !place.geometry.location) {
      toast.error("Invalid place selection");
      return;
    }

    console.log("Place selected:", place);

    // Extract location from place
    const newLocation = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    // Update location state
    locationState.setMapCenter(newLocation);

    // If the place has a place_id, try to find it in existing venues
    if (place.place_id) {
      // Check if we already have this venue
      const existingVenue = venueSearch.venues.find(v => v.id === place.place_id);
      
      if (existingVenue) {
        // If we have it, select it
        console.log("Selecting existing venue:", existingVenue.name);
        selectedVenueState.handleVenueSelect(existingVenue.id);
      } else {
        // If not, we might want to fetch its details and add it to venues
        console.log("New place selected, may need to fetch details:", place);
        
        // If we have a name and place_id, we can create a temporary venue
        if (place.name) {
          const tempVenue: Venue = {
            id: place.place_id,
            name: place.name,
            address: place.vicinity || place.formatted_address || "",
            coordinates: {
              lat: newLocation.lat,
              lng: newLocation.lng
            },
            category: place.types || [],
            photos: place.photos ? 
              place.photos.map(p => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`) : 
              []
          };
          
          // Add this venue to our list and select it
          venueSearch.setVenues(prev => [...prev, tempVenue]);
          selectedVenueState.handleVenueSelect(tempVenue.id);
        }
      }
    }
  }, [locationState, venueSearch.venues, selectedVenueState, venueSearch.setVenues]);
  
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
    
    // Enhanced place selection handler
    handlePlaceSelect,
    
    // Check-in methods
    handleCheckIn,
    processCheckIn,
    
    // Convenience method to load more venues
    handleLoadMore: () => venueSearch.handleLoadMore(locationState.userLocation)
  };
};
