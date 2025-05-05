
import { useState } from 'react';
import { Venue } from '@/types';
import { PlacesService } from '@/services/PlacesService';
import { toast } from 'sonner';
import { useLocation } from './useLocation';
import { useMapInteraction } from './useMapInteraction';
import { useVenueSearch } from './useVenueSearch';
import { useVisitData } from './useVisitData';

interface UseVenuesProps {
  initialLocation?: { lat: number; lng: number };
}

export const useVenues = ({ initialLocation }: UseVenuesProps = {}) => {
  // Use custom hooks for better code organization
  const { userLocation, setUserLocation } = useLocation(initialLocation);
  const { mapCenter, setMapCenter, showSearchThisArea, handleMapMove, setShowSearchThisArea } = useMapInteraction();
  const { visits, processCheckIn } = useVisitData();
  const { venues, isLoading, usingMockData, nextPageToken, handleLoadMore, handleSearchThisArea, handlePlaceSelect: originalHandlePlaceSelect } = useVenueSearch({
    userLocation,
    mapCenter,
    visits
  });

  // Enhanced place selection handler that also centers the map
  const handlePlaceSelect = async (venue: Venue) => {
    console.log("handlePlaceSelect called with venue:", venue);
    
    // If we already have coordinates, update the selected venue right away
    if (venue.coordinates && venue.coordinates.lat !== 0 && venue.coordinates.lng !== 0) {
      console.log("Using existing coordinates:", venue.coordinates);
      // Center map on the selected venue
      setMapCenter(venue.coordinates);
      originalHandlePlaceSelect(venue);
    } 
    // Otherwise fetch details to get coordinates
    else {
      console.log("Fetching venue details to get coordinates");
      try {
        const details = await PlacesService.getVenueDetails(venue.id);
        if (details) {
          console.log("Got venue details with coordinates:", details.coordinates);
          // Center map on the selected venue
          setMapCenter(details.coordinates);
          originalHandlePlaceSelect(details);
        } else {
          console.error("Could not get valid venue details");
          toast.error("Could not get details for this venue");
        }
      } catch (error) {
        console.error("Error fetching venue details:", error);
        toast.error("Could not get details for this venue");
      }
    }
  };

  return {
    venues,
    userLocation,
    isLoading,
    usingMockData,
    nextPageToken,
    showSearchThisArea,
    setMapCenter,
    handleMapMove,
    handleSearchThisArea,
    handlePlaceSelect,
    handleLoadMore,
    processCheckIn,
    visits
  };
};
