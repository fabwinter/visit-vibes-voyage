
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
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [selectedVenueDetails, setSelectedVenueDetails] = useState<Venue | null>(null);
  const [surroundingVenues, setSurroundingVenues] = useState<Venue[]>([]);
  
  // Use custom hooks for better code organization
  const { userLocation, setUserLocation } = useLocation(initialLocation);
  const { mapCenter, setMapCenter, showSearchThisArea, handleMapMove, setShowSearchThisArea } = useMapInteraction();
  const { visits, processCheckIn } = useVisitData();
  const { venues, isLoading, usingMockData, nextPageToken, handleLoadMore, handleSearchThisArea, handlePlaceSelect: originalHandlePlaceSelect } = useVenueSearch({
    userLocation,
    mapCenter,
    visits
  });

  // Find surrounding venues within radius of a selected venue
  const findSurroundingVenues = (centralVenue: Venue, allVenues: Venue[], radiusKm: number = 1) => {
    if (!centralVenue || !centralVenue.coordinates) return [];
    
    return allVenues.filter(venue => {
      if (venue.id === centralVenue.id) return false;
      
      // Calculate distance between venues
      const distance = calculateDistance(
        centralVenue.coordinates.lat,
        centralVenue.coordinates.lng,
        venue.coordinates.lat,
        venue.coordinates.lng
      );
      
      return distance <= radiusKm;
    });
  };

  // Calculate distance between two points in km using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Enhanced place selection handler that also centers the map and handles surrounding venues
  const handlePlaceSelect = async (venue: Venue) => {
    // If we already have coordinates, update the selected venue right away
    if (venue.coordinates.lat !== 0 && venue.coordinates.lng !== 0) {
      // Center map on the selected venue
      setMapCenter(venue.coordinates);
      setSelectedVenue(venue.id);
      setSelectedVenueDetails(venue);
      
      // Find surrounding venues
      const nearby = findSurroundingVenues(venue, venues, 1);
      setSurroundingVenues(nearby);
      
      // Add to venues list if not already there
      const alreadyInVenues = venues.some(v => v.id === venue.id);
      if (!alreadyInVenues) {
        originalHandlePlaceSelect(venue);
      }
    } 
    // Otherwise fetch details to get coordinates
    else {
      try {
        const details = await PlacesService.getVenueDetails(venue.id);
        if (details) {
          // Center map on the selected venue
          setMapCenter(details.coordinates);
          setSelectedVenue(details.id);
          setSelectedVenueDetails(details);
          
          // Find surrounding venues
          const nearby = findSurroundingVenues(details, venues, 1);
          setSurroundingVenues(nearby);
          
          // Add to venues list if not already there
          originalHandlePlaceSelect(details);
        }
      } catch (error) {
        console.error("Error fetching venue details:", error);
        toast.error("Could not get details for this venue");
      }
    }
  };

  // Handle venue selection from map or list
  const handleVenueSelect = async (venueId: string) => {
    setSelectedVenue(venueId);
    
    // Find venue in the list
    const venue = venues.find(v => v.id === venueId);
    
    if (venue) {
      setSelectedVenueDetails(venue);
      setMapCenter(venue.coordinates);
      
      // Find surrounding venues
      const nearby = findSurroundingVenues(venue, venues, 1);
      setSurroundingVenues(nearby);
    } else {
      // Fetch venue details if not in our current list
      try {
        const details = await PlacesService.getVenueDetails(venueId);
        if (details) {
          setSelectedVenueDetails(details);
          setMapCenter(details.coordinates);
          
          // Find surrounding venues
          const nearby = findSurroundingVenues(details, venues, 1);
          setSurroundingVenues(nearby);
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
    handleVenueSelect,
    handleLoadMore,
    processCheckIn,
    visits,
    selectedVenue,
    selectedVenueDetails,
    surroundingVenues
  };
};
