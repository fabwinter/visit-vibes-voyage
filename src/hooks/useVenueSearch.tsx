import { useState, useEffect } from 'react';
import { Venue } from '@/types';
import { MapboxService } from '@/services/mapbox';
import { toast } from 'sonner';

interface UseVenueSearchProps {
  userLocation: { lat: number; lng: number };
  mapCenter: { lat: number; lng: number } | null;
  visits: any[];
}

export const useVenueSearch = ({ userLocation, mapCenter, visits }: UseVenueSearchProps) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Fetch venues when user location or map center changes
  useEffect(() => {
    if (mapCenter) {
      fetchVenues(undefined, mapCenter);
    } else if (userLocation.lat !== -33.8688 || userLocation.lng !== 151.2093) {
      // Only fetch if we have a real user location (not the default)
      fetchVenues();
    }
  }, [userLocation, mapCenter]);
  
  // Function to fetch venues from Mapbox API
  const fetchVenues = async (pageToken?: string, searchLocation?: { lat: number; lng: number }) => {
    setIsLoading(true);
    
    try {
      console.log("Fetching venues from Mapbox API...");
      // Using new MapboxService directly instead of PlacesService wrapper
      const result = await MapboxService.searchNearbyVenues(
        searchLocation || userLocation
      );
      
      console.log(`Fetched ${result.length} venues from API`);
      
      // Enhanced to properly save venues with visit data
      const venuesWithVisitData = result.map(venue => {
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
      setNextPageToken(undefined); // Mapbox doesn't have pagination tokens like Google
      setUsingMockData(false);
      
      // Store venues in localStorage for other views
      localStorage.setItem('venues', JSON.stringify(venuesWithVisitData));
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast.error("Error fetching venues", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      // Instead of using mock data, show an empty state
      setVenues([]);
      setUsingMockData(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more venues - not applicable with Mapbox, but keeping the interface
  const handleLoadMore = () => {
    if (nextPageToken) {
      fetchVenues(nextPageToken);
    }
  };
  
  // Handle search this area
  const handleSearchThisArea = () => {
    if (mapCenter) {
      fetchVenues(undefined, mapCenter);
    }
  };
  
  // Handle place selection from autocomplete
  const handlePlaceSelect = async (venue: Venue) => {
    console.log("Selected venue:", venue);
    
    // Add this venue to our list if it's not there already
    setVenues(prevVenues => {
      const exists = prevVenues.some(v => v.id === venue.id);
      if (!exists) {
        // Find visits for this venue
        const venueVisits = visits.filter(visit => visit.venueId === venue.id);
        
        // Get the most recent visit
        let lastVisit = undefined;
        if (venueVisits.length > 0) {
          venueVisits.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          lastVisit = venueVisits[0];
        }
        
        return [{...venue, lastVisit}, ...prevVenues];
      }
      return prevVenues;
    });
  };

  return {
    venues,
    isLoading,
    usingMockData,
    nextPageToken,
    handleLoadMore,
    handleSearchThisArea,
    handlePlaceSelect
  };
};
