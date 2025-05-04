
import { useState, useCallback, useMemo } from 'react';
import { Venue } from '@/types';

// Calculate distance between two points using Haversine formula
const getDistanceBetweenPoints = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

export const useSelectedVenue = (venues: Venue[]) => {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [selectedVenueDetails, setSelectedVenueDetails] = useState<Venue | null>(null);
  
  // Function to handle venue selection
  const handleVenueSelect = useCallback((venueId: string) => {
    setSelectedVenue(venueId);
    const venue = venues.find(v => v.id === venueId);
    setSelectedVenueDetails(venue || null);
  }, [venues]);
  
  // Calculate surrounding venues (close to selected venue)
  const calculateSurroundingVenues = useCallback(() => {
    if (!selectedVenue || !selectedVenueDetails) return [];
    
    const nearbyVenues = venues.filter(venue => {
      if (venue.id === selectedVenue) return false;
      
      const distance = getDistanceBetweenPoints(
        selectedVenueDetails.coordinates.lat, selectedVenueDetails.coordinates.lng,
        venue.coordinates.lat, venue.coordinates.lng
      );
      
      // Return venues within 500 meters of selected venue
      return distance <= 500;
    });
    
    // Sort by proximity
    return nearbyVenues.sort((a, b) => {
      const distanceA = getDistanceBetweenPoints(
        selectedVenueDetails.coordinates.lat, selectedVenueDetails.coordinates.lng,
        a.coordinates.lat, a.coordinates.lng
      );
      const distanceB = getDistanceBetweenPoints(
        selectedVenueDetails.coordinates.lat, selectedVenueDetails.coordinates.lng,
        b.coordinates.lat, b.coordinates.lng
      );
      return distanceA - distanceB;
    }).slice(0, 5); // Only show the 5 closest venues
  }, [selectedVenue, selectedVenueDetails, venues]);
  
  // Memoized surrounding venues
  const surroundingVenues = useMemo(() => calculateSurroundingVenues(), 
    [calculateSurroundingVenues]);
  
  return {
    selectedVenue,
    selectedVenueDetails,
    surroundingVenues,
    handleVenueSelect
  };
};
