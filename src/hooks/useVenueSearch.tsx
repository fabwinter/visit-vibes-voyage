
import { useState, useEffect } from 'react';
import { Venue } from '@/types';
import { PlacesService } from '@/services/PlacesService';
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
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [usingMockData, setUsingMockData] = useState(false);
  const [highlightedVenueId, setHighlightedVenueId] = useState<string | null>(null);
  
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
        radius: 2000, // Changed to 2km radius
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

  // Load more venues
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
  
  // Handle place selection from autocomplete - enhanced to put selected venue at the top of the list
  const handlePlaceSelect = async (venue: Venue) => {
    console.log("Selected venue:", venue);
    
    setHighlightedVenueId(venue.id);
    
    // Add this venue to our list if it's not there already, and place it at the top
    setVenues(prevVenues => {
      const exists = prevVenues.some(v => v.id === venue.id);
      if (!exists) {
        // Put the selected venue at the top of the list
        return [venue, ...prevVenues];
      } else {
        // Reorder to put the existing venue at the top
        const filteredVenues = prevVenues.filter(v => v.id !== venue.id);
        const existingVenue = prevVenues.find(v => v.id === venue.id);
        if (existingVenue) {
          return [existingVenue, ...filteredVenues];
        }
      }
      return prevVenues;
    });
    
    // Automatically highlight the venue after a short delay
    setTimeout(() => {
      const venueCard = document.getElementById(`venue-${venue.id}`);
      if (venueCard) {
        venueCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return {
    venues,
    isLoading,
    usingMockData,
    nextPageToken,
    highlightedVenueId,
    handleLoadMore,
    handleSearchThisArea,
    handlePlaceSelect
  };
};
