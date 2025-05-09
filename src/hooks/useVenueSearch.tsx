
import { useState, useEffect, useCallback } from 'react';
import { Venue } from '@/types';
import { FoursquareService } from '@/services/foursquare';
import { toast } from 'sonner';
import { mockVenues } from '@/data/mockData';

interface UseVenueSearchProps {
  userLocation: { lat: number; lng: number };
  mapCenter: { lat: number; lng: number } | null;
  visits: any[];
}

export const useVenueSearch = ({ userLocation, mapCenter, visits }: UseVenueSearchProps) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Check network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online! Refreshing data...");
      // If we have a location, fetch real venues
      if (mapCenter || userLocation) {
        fetchVenues(mapCenter || userLocation);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You're offline. Using stored data instead.", {
        duration: 5000
      });
      // Use mock data when offline
      loadMockVenues();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userLocation, mapCenter]);
  
  // Load mock venues with visit data
  const loadMockVenues = useCallback(() => {
    setIsLoading(true);
    
    // Add random coordinates near the current location
    const location = mapCenter || userLocation;
    const venuesWithLocation = mockVenues.map(venue => {
      // Create a slight offset from the requested location
      const latOffset = (Math.random() - 0.5) * 0.01;
      const lngOffset = (Math.random() - 0.5) * 0.01;
      
      return {
        ...venue,
        coordinates: {
          lat: location.lat + latOffset,
          lng: location.lng + lngOffset
        }
      };
    });
    
    // Add visit data to mock venues
    const venuesWithVisitData = venuesWithLocation.map(venue => {
      // Find all visits for this venue
      const venueVisits = visits.filter(visit => visit.venueId === venue.id);
      
      if (venueVisits.length > 0) {
        venueVisits.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        return {
          ...venue,
          lastVisit: venueVisits[0]
        };
      }
      return venue;
    });
    
    setVenues(venuesWithVisitData);
    setUsingMockData(true);
    setIsLoading(false);
    
    // Store venues in localStorage for other views
    localStorage.setItem('venues', JSON.stringify(venuesWithVisitData));
  }, [mapCenter, userLocation, visits]);
  
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
    // If offline, load mock data instead
    if (!navigator.onLine) {
      loadMockVenues();
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting to fetch venues from Foursquare API...");
      const result = await FoursquareService.searchNearbyVenues({
        location: searchLocation,
        radius: 5000 // 5km radius
      });
      
      if (result.venues.length === 0) {
        console.log("No venues returned from API");
        toast.info("No venues found in this area. Using suggested venues instead.");
        loadMockVenues();
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
      toast.error("Error loading venues from API", {
        description: "Using suggested venues instead",
        duration: 5000
      });
      loadMockVenues();
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
        } else {
          // If we can't get details, make up some coordinates near user location
          const location = mapCenter || userLocation;
          venue.coordinates = {
            lat: location.lat + (Math.random() - 0.5) * 0.01,
            lng: location.lng + (Math.random() - 0.5) * 0.01
          };
        }
      } catch (error) {
        console.error("Error fetching venue details:", error);
        // If the API call fails, make up some coordinates near user location
        const location = mapCenter || userLocation;
        venue.coordinates = {
          lat: location.lat + (Math.random() - 0.5) * 0.01,
          lng: location.lng + (Math.random() - 0.5) * 0.01
        };
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
    usingMockData,
    handleSearchThisArea,
    handlePlaceSelect
  };
};
