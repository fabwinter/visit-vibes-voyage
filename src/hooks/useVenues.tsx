
import { useState, useCallback } from 'react';
import { Venue } from '@/types';
import { FoursquareService } from '@/services/foursquare';
import { toast } from 'sonner';
import { useLocation } from './useLocation';
import { useMapInteraction } from './useMapInteraction';
import { useVisitData } from './useVisitData';
import { useAuth } from './useAuth';

interface UseVenuesProps {
  initialLocation?: { lat: number; lng: number };
}

export const useVenues = ({ initialLocation }: UseVenuesProps = {}) => {
  // Get location and map state
  const { userLocation } = useLocation(initialLocation);
  const { mapCenter, setMapCenter, showSearchThisArea, handleMapMove, setShowSearchThisArea } = useMapInteraction();
  const { visits, processCheckIn } = useVisitData();
  const { user } = useAuth();
  
  // Local state
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load venues in the current area
  const handleSearchThisArea = useCallback(async () => {
    if (!mapCenter && !userLocation) {
      toast.error("Could not determine location");
      return;
    }
    
    const searchLocation = mapCenter || userLocation;
    setIsLoading(true);
    setShowSearchThisArea(false);
    
    try {
      console.log("Searching for venues near:", searchLocation);
      const result = await FoursquareService.searchNearbyVenues({
        location: searchLocation,
        radius: 5000 // 5km radius
      });
      
      console.log("Found venues:", result.venues);
      
      // Add visit data to venues
      const venuesWithVisits = result.venues.map(venue => {
        // Find all visits for this venue
        const venueVisits = visits.filter(visit => visit.venueId === venue.id);
        
        // Sort visits by date (newest first)
        if (venueVisits.length > 0) {
          venueVisits.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          
          // Add the latest visit to the venue
          return {
            ...venue,
            lastVisit: venueVisits[0]
          };
        }
        return venue;
      });
      
      setVenues(venuesWithVisits);
    } catch (error) {
      console.error("Error searching area:", error);
      toast.error("Could not load venues in this area");
    } finally {
      setIsLoading(false);
    }
  }, [mapCenter, userLocation, visits, setShowSearchThisArea]);

  // Handle venue selection
  const handlePlaceSelect = useCallback(async (venueOrId: Venue | string) => {
    let venue: Venue | null = null;
    
    // If a string ID was passed, find the venue in our list
    if (typeof venueOrId === 'string') {
      venue = venues.find(v => v.id === venueOrId) || null;
      
      // If not found in our list, fetch the details
      if (!venue) {
        setIsLoading(true);
        try {
          venue = await FoursquareService.getVenueDetails(venueOrId);
        } catch (error) {
          console.error("Error fetching venue details:", error);
          toast.error("Could not get details for this venue");
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      venue = venueOrId;
    }
    
    if (venue) {
      setSelectedVenue(venue);
      
      // Center the map on the selected venue
      if (venue.coordinates && venue.coordinates.lat !== 0) {
        setMapCenter(venue.coordinates);
      }
    }
    
    return venue;
  }, [venues, setMapCenter]);

  // Function to center the map back to user location
  const centerToUserLocation = useCallback(() => {
    if (!userLocation) {
      toast.error("Could not determine your location");
      return;
    }

    console.log("Centering map on user location:", userLocation);
    setMapCenter(userLocation);
    toast.success("Map centered on your location");
    
    // If we don't have venues yet, search in this area
    if (venues.length === 0) {
      handleSearchThisArea();
    }
  }, [userLocation, setMapCenter, venues, handleSearchThisArea]);

  // Check-in handler with authentication check
  const handleCheckIn = useCallback(async (visit: any) => {
    if (!user && visit.userId) {
      toast.error("You need to sign in to check in");
      return null;
    }
    
    // If userId is required but not provided, add the current user's ID
    if (user && !visit.userId) {
      visit.userId = user.id;
    }
    
    return processCheckIn(visit);
  }, [user, processCheckIn]);

  // Load venues when initially mounted
  // Only run when location is available
  useState(() => {
    if ((userLocation || mapCenter) && venues.length === 0) {
      handleSearchThisArea();
    }
  });

  return {
    venues,
    selectedVenue,
    userLocation,
    isLoading,
    usingMockData: false,
    showSearchThisArea,
    setMapCenter,
    handleMapMove,
    handleSearchThisArea,
    handlePlaceSelect,
    handleLoadMore: () => {}, // Not supported with Foursquare
    processCheckIn: handleCheckIn,
    visits,
    centerToUserLocation
  };
};
