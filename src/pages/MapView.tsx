
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { mockVenues, mockVisits } from '../data/mockData';
import CheckInButton from '../components/CheckInButton';
import VenueCard from '../components/VenueCard';
import MapComponent from '../components/MapComponent';
import VenueFilters, { FilterOptions } from '../components/VenueFilters';
import PlaceSearchInput from '../components/PlaceSearchInput';
import CheckInForm from '../components/CheckInForm';
import { Venue, Visit } from '@/types';
import { filterVenues, extractCategories, extractTags } from '../utils/filterUtils';
import { toast } from "sonner";
import { PlacesService } from '../services/PlacesService';
import { Button } from '@/components/ui/button';
import { Share2, MapPin } from 'lucide-react';

const MapView = () => {
  const location = useLocation();
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    rating: 'all',
    category: 'all',
    tags: [],
  });
  
  // Venues state with loading and error handling
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Default to Sydney CBD
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ 
    lat: -33.8688, lng: 151.2093 
  });
  const [selectedVenueDetails, setSelectedVenueDetails] = useState<Venue | null>(null);
  
  // Check-in related states
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [visits, setVisits] = useState<Visit[]>([]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          console.log("User location detected:", latitude, longitude);
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast("Could not access your location", {
            description: "Using default location. Check browser permissions."
          });
        }
      );
    } else {
      toast("Geolocation is not supported by this browser", {
        description: "Using default location."
      });
    }
  }, []);

  // Check if we need to select a venue from navigation state
  useEffect(() => {
    if (location.state?.selectedVenueId) {
      setSelectedVenue(location.state.selectedVenueId);
    }
  }, [location.state]);

  // Fetch venues and visits on initial load or when user location changes
  useEffect(() => {
    fetchVenues();
    loadVisits();
  }, [userLocation]);
  
  // Load visits from localStorage
  const loadVisits = () => {
    const storedVisits = localStorage.getItem('visits');
    if (storedVisits) {
      setVisits(JSON.parse(storedVisits));
    }
  };
  
  // Save visits to localStorage when they change
  useEffect(() => {
    if (visits.length > 0) {
      localStorage.setItem('visits', JSON.stringify(visits));
    }
  }, [visits]);
  
  // Function to fetch venues from Places API
  const fetchVenues = async (pageToken?: string) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting to fetch venues from API...");
      const result = await PlacesService.searchNearbyVenues({
        location: userLocation,
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
        // Add visit data to venues if available
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
  
  // Handle place selection from autocomplete
  const handlePlaceSelect = async (venue: Venue) => {
    console.log("Selected venue:", venue);
    
    // If we already have coordinates, update the selected venue right away
    if (venue.coordinates.lat !== 0 && venue.coordinates.lng !== 0) {
      setSelectedVenue(venue.id);
      setSelectedVenueDetails(venue);
      
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
          setSelectedVenue(details.id);
          setSelectedVenueDetails(details);
          
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
  
  // Apply additional filters
  const filteredVenues = filterVenues(venues, filterOptions);
  
  // Extract unique categories and tags
  const categories = extractCategories(venues);
  const tags = extractTags(venues);
  
  // Handle venue selection from map or list
  const handleVenueSelect = async (venueId: string) => {
    setSelectedVenue(venueId);
    
    // Get venue details if not already selected
    if (!selectedVenueDetails || selectedVenueDetails.id !== venueId) {
      const venue = venues.find(v => v.id === venueId);
      
      if (venue) {
        setSelectedVenueDetails(venue);
      } else {
        // Fetch details if not in our current list
        try {
          const details = await PlacesService.getVenueDetails(venueId);
          if (details) {
            setSelectedVenueDetails(details);
          }
        } catch (error) {
          console.error("Error fetching venue details:", error);
        }
      }
    }
    
    // Scroll to the selected venue card if it exists
    const venueCard = document.getElementById(`venue-${venueId}`);
    if (venueCard) {
      venueCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Handle check-in
  const handleCheckIn = () => {
    if (selectedVenueDetails) {
      setIsCheckInOpen(true);
    } else {
      toast.error("Please select a venue first");
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
    
    // Close the dialog
    setIsCheckInOpen(false);
    toast.success("Check-in successful!");
  };

  // Load more venues
  const handleLoadMore = () => {
    if (nextPageToken) {
      fetchVenues(nextPageToken);
    }
  };
  
  return (
    <div className="h-[calc(100vh-132px)] flex flex-col md:flex-row">
      {/* Map - Now on the left side for better visibility */}
      <div className="w-full md:w-1/2 lg:w-3/5 h-[350px] md:h-full md:order-1 p-4">
        <div className="h-full rounded-lg overflow-hidden border border-gray-200 shadow-md">
          <MapComponent 
            venues={filteredVenues} 
            onVenueSelect={handleVenueSelect}
            userLocation={userLocation}
            selectedVenue={selectedVenue}
            className="w-full h-full"
          />
        </div>
      </div>
      
      {/* Right side - Search, Filters and Venue List */}
      <div className="w-full md:w-1/2 lg:w-2/5 md:h-full md:overflow-y-auto p-4 md:order-2">
        {/* Search with autocomplete */}
        <PlaceSearchInput 
          onSelect={handlePlaceSelect}
          userLocation={userLocation}
          className="mb-4"
        />

        {/* Filters component */}
        <VenueFilters 
          onFilterChange={setFilterOptions}
          categories={categories}
          tags={tags}
        />
        
        {usingMockData && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
            Using mock data. API connection issue or no results returned.
          </div>
        )}
        
        {/* Selected venue details if available */}
        {selectedVenueDetails && (
          <div className="my-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold mb-2">{selectedVenueDetails.name}</h2>
            
            {selectedVenueDetails.photos && selectedVenueDetails.photos.length > 0 && (
              <div className="mb-3 rounded-md overflow-hidden">
                <img 
                  src={selectedVenueDetails.photos[0]} 
                  alt={selectedVenueDetails.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                  }}
                />
              </div>
            )}
            
            <p className="text-gray-600 mb-2">
              📍 {selectedVenueDetails.address}
            </p>
            
            {selectedVenueDetails.phoneNumber && (
              <p className="text-gray-600 mb-2">📞 {selectedVenueDetails.phoneNumber}</p>
            )}
            
            {selectedVenueDetails.website && (
              <p className="text-gray-600 mb-2">
                <a href={selectedVenueDetails.website} target="_blank" rel="noopener noreferrer" 
                   className="text-visitvibe-primary hover:underline">
                  Website
                </a>
              </p>
            )}
            
            {selectedVenueDetails.hours && (
              <p className="text-gray-600 mb-2 text-sm">{selectedVenueDetails.hours}</p>
            )}
            
            {selectedVenueDetails.category && selectedVenueDetails.category.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {selectedVenueDetails.category.map((cat) => (
                  <span key={cat} className="tag-badge">
                    {cat.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
            
            <div className="mt-4 flex flex-col space-y-2">
              <Button 
                onClick={handleCheckIn} 
                className="w-full bg-visitvibe-primary hover:bg-visitvibe-primary/90"
              >
                Check In
              </Button>
              
              <Button 
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: selectedVenueDetails.name,
                      text: `Check out ${selectedVenueDetails.name} at ${selectedVenueDetails.address}`,
                      url: window.location.href
                    })
                    .then(() => toast.success("Shared successfully"))
                    .catch(error => console.error('Error sharing', error));
                  } else {
                    toast("Sharing not supported on this browser", {
                      description: "Try copying the link directly"
                    });
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
                Share Venue
              </Button>
            </div>
          </div>
        )}
        
        {/* Venues list */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">Food Venues</h2>
            <span className="text-sm text-gray-500">
              {isLoading ? 'Loading...' : `${filteredVenues.length} results`}
            </span>
          </div>
          
          {isLoading && filteredVenues.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-visitvibe-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-500">Loading food venues...</p>
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {(filterOptions.rating !== 'all' || filterOptions.category !== 'all' || (filterOptions.tags?.length || 0) > 0) ? (
                <p>No food venues match your filters</p>
              ) : (
                <p>No food venues found in this area</p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {filteredVenues.map((venue) => (
                  <div 
                    key={venue.id} 
                    id={`venue-${venue.id}`}
                    className={`transition-all duration-200 ${selectedVenue === venue.id ? 'ring-2 ring-visitvibe-primary ring-offset-2' : ''}`}
                  >
                    <VenueCard
                      venue={venue}
                      lastVisit={venue.lastVisit}
                      onClick={() => handleVenueSelect(venue.id)}
                    />
                  </div>
                ))}
              </div>
              
              {nextPageToken && !usingMockData && (
                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More Venues'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating check-in button */}
      <CheckInButton 
        className="fixed right-6 bottom-24 w-14 h-14"
        onClick={handleCheckIn}
      />

      {/* Check-in form dialog */}
      {selectedVenueDetails && (
        <CheckInForm
          venue={selectedVenueDetails}
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          onCheckIn={processCheckIn}
        />
      )}
    </div>
  );
};

export default MapView;
