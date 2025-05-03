import { useState, useEffect } from 'react';
import { Venue, Visit } from '@/types';
import { PlacesService } from '@/services/PlacesService';
import { toast } from 'sonner';
import { mockVenues } from '@/data/mockData';

interface UseVenuesProps {
  initialLocation?: { lat: number; lng: number };
}

export const useVenues = ({ initialLocation }: UseVenuesProps = {}) => {
  // Default to Sydney CBD, but this will be updated with user location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(
    initialLocation || { lat: -33.8688, lng: 151.2093 }
  );
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [usingMockData, setUsingMockData] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [visits, setVisits] = useState<Visit[]>([]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      // Show loading toast
      const loadingToastId = toast.loading("Getting your current location...");
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
          console.log("User location detected:", latitude, longitude);
          toast.dismiss(loadingToastId);
          toast.success("Location found", {
            description: "Showing food venues near you"
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast.dismiss(loadingToastId);
          toast.error("Could not access your location", {
            description: "Using default location. Check browser permissions."
          });
        },
        // Options for better geolocation
        { 
          enableHighAccuracy: true, 
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast("Geolocation is not supported by this browser", {
        description: "Using default location."
      });
    }
  }, []);

  // Load visits from localStorage
  useEffect(() => {
    const storedVisits = localStorage.getItem('visits');
    if (storedVisits) {
      setVisits(JSON.parse(storedVisits));
    }
  }, []);
  
  // Save visits to localStorage when they change
  useEffect(() => {
    if (visits.length > 0) {
      localStorage.setItem('visits', JSON.stringify(visits));
    }
  }, [visits]);

  // Fetch venues when user location or map center changes
  useEffect(() => {
    if (mapCenter) {
      fetchVenues(undefined, mapCenter);
    } else if (userLocation.lat !== -33.8688 || userLocation.lng !== 151.2093) {
      // Only fetch if we have a real user location (not the default)
      fetchVenues();
    }
  }, [userLocation, mapCenter]);

  // Function to fetch venues from Places API
  const fetchVenues = async (pageToken?: string, searchLocation?: { lat: number; lng: number }) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting to fetch venues from API...");
      const result = await PlacesService.searchNearbyVenues({
        location: searchLocation || userLocation,
        radius: 5000, // 5km radius
        type: "restaurant", // Default to food venues
        pageToken: pageToken
      });
      
      if (result.venues.length === 0 && !pageToken) {
        // If no results and it's the initial fetch, fall back to mock data
        console.log("No venues returned from API, falling back to mock data");
        prepareMockData();
        setUsingMockData(true);
      } else if (result.venues.length > 0) {
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
        
        if (pageToken) {
          setVenues(prevVenues => [...prevVenues, ...venuesWithVisitData]);
        } else {
          setVenues(venuesWithVisitData);
        }
        setNextPageToken(result.nextPageToken);
        setUsingMockData(false);
        
        // Store venues in localStorage for other views
        localStorage.setItem('venues', JSON.stringify(venuesWithVisitData));
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast("Error fetching venues. Using mock data instead.", {
        description: error instanceof Error ? error.message : undefined
      });
      prepareMockData();
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
      // Hide the "Search This Area" button after search is complete
      setShowSearchThisArea(false);
    }
  };

  // Prepare mock data by adding last visit information
  const prepareMockData = () => {
    const venuesWithLastVisit = mockVenues.map(venue => {
      // Find all visits for this venue
      const venueVisits = visits.filter(visit => visit.venueId === venue.id);
      
      // Sort by date (newest first)
      venueVisits.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Add the latest visit to the venue
      return {
        ...venue,
        lastVisit: venueVisits[0]
      };
    });
    
    setVenues(venuesWithLastVisit);
    
    // Store venues in localStorage for other views
    localStorage.setItem('venues', JSON.stringify(venuesWithLastVisit));
  };

  // Handle map move to show "Search this area" button
  const handleMapMove = (newCenter: { lat: number; lng: number }) => {
    // Only show the button if the center has moved significantly
    if (mapCenter) {
      const distance = calculateDistance(mapCenter, newCenter);
      if (distance > 1) { // If moved more than 1km
        setShowSearchThisArea(true);
      }
    }
  };
  
  // Calculate distance between two points in km
  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Handle search this area
  const handleSearchThisArea = () => {
    if (mapCenter) {
      fetchVenues(undefined, mapCenter);
    }
  };

  // Process the check-in data
  const processCheckIn = (visit: Visit) => {
    // Add the new visit
    const updatedVisits = [visit, ...visits];
    setVisits(updatedVisits);
    
    // Save visits to localStorage
    localStorage.setItem('visits', JSON.stringify(updatedVisits));
    
    // Update the venue with the new visit
    setVenues(prev => 
      prev.map(venue => 
        venue.id === visit.venueId 
          ? { ...venue, lastVisit: visit } 
          : venue
      )
    );
    
    toast.success("Check-in successful!");
  };

  // Handle place selection from autocomplete - enhanced to center map
  const handlePlaceSelect = async (venue: Venue) => {
    console.log("Selected venue:", venue);
    
    // If we already have coordinates, update the selected venue right away
    if (venue.coordinates.lat !== 0 && venue.coordinates.lng !== 0) {
      // Center map on the selected venue
      setMapCenter(venue.coordinates);
      
      // Add this venue to our list if it's not there already
      setVenues(prevVenues => {
        const exists = prevVenues.some(v => v.id === venue.id);
        if (!exists) {
          return [venue, ...prevVenues];
        }
        return prevVenues;
      });
    } 
    // Otherwise fetch details to get coordinates
    else {
      try {
        const details = await PlacesService.getVenueDetails(venue.id);
        if (details) {
          // Center map on the selected venue
          setMapCenter(details.coordinates);
          
          // Add this venue to our list if it's not there already
          setVenues(prevVenues => {
            const exists = prevVenues.some(v => v.id === details.id);
            if (!exists) {
              return [details, ...prevVenues];
            }
            return prevVenues;
          });
        }
      } catch (error) {
        console.error("Error fetching venue details:", error);
        toast.error("Could not get details for this venue");
      }
    }
  };

  // Load more venues
  const handleLoadMore = () => {
    if (nextPageToken) {
      fetchVenues(nextPageToken);
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
