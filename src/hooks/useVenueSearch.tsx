
import { useState, useEffect } from 'react';
import { Venue } from '@/types';
import { FoursquareService } from '@/services/foursquare';
import { toast } from 'sonner';

interface UseVenueSearchProps {
  userLocation: { lat: number; lng: number };
  mapCenter: { lat: number; lng: number } | null;
  visits: any[];
}

export const useVenueSearch = ({ userLocation, mapCenter, visits }: UseVenueSearchProps) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Fetch venues when user location or map center changes
  useEffect(() => {
    if (mapCenter) {
      fetchVenues(mapCenter);
    } else if (userLocation.lat !== -33.8688 || userLocation.lng !== 151.2093) {
      // Only fetch if we have a real user location (not the default)
      fetchVenues(userLocation);
    }
  }, [userLocation, mapCenter]);
  
  // Function to fetch venues from Foursquare API
  const fetchVenues = async (searchLocation: { lat: number; lng: number }) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting to fetch venues from Foursquare API...");
      const result = await FoursquareService.searchNearbyVenues({
        location: searchLocation,
        radius: 5000 // 5km radius
      });
      
      if (result.venues.length === 0) {
        console.log("No venues returned from API");
        toast.info("No venues found in this area. Try moving the map to a different location.");
        setVenues([]);
      } else {
        console.log(`Fetched ${result.venues.length} venues from API`);
        
        // Enhanced to properly save venues with visit data
        const venuesWithVisitData = result.venues.map(venue => {
          // Find all visits for this venue
          const venueVisits = visits.filter(visit => visit.venueId === venue.id);
          
          // Sort by date (newest first)
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
        
        setVenues(venuesWithVisitData);
        setUsingMockData(false);
        
        // Store venues in localStorage for other views
        localStorage.setItem('venues', JSON.stringify(venuesWithVisitData));
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast.error("Error fetching venues", {
        description: error instanceof Error ? error.message : undefined
      });
      setVenues([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle place selection from autocomplete - enhanced to center map
  const handlePlaceSelect = async (venue: Venue) => {
    console.log("Selected venue:", venue);
    
    // If the venue has no coordinates, get details first
    if (venue.coordinates.lat === 0 && venue.coordinates.lng === 0) {
      try {
        const details = await FoursquareService.getVenueDetails(venue.id);
        if (details) {
          venue = details;
        }
      } catch (error) {
        console.error("Error fetching venue details:", error);
      }
    }
    
    // Add this venue to our list if it's not there already
    setVenues(prevVenues => {
      const exists = prevVenues.some(v => v.id === venue.id);
      if (!exists) {
        return [venue, ...prevVenues];
      }
      return prevVenues;
    });
    
    return venue;
  };

  // Handle search this area
  const handleSearchThisArea = () => {
    if (mapCenter) {
      fetchVenues(mapCenter);
    }
  };

  return {
    venues,
    isLoading,
    usingMockData: false, // We're no longer using mock data in this implementation
    handleSearchThisArea,
    handlePlaceSelect
  };
};
