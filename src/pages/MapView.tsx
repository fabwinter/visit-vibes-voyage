
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { mockVenues, mockVisits } from '../data/mockData';
import CheckInButton from '../components/CheckInButton';
import VenueCard from '../components/VenueCard';
import MapComponent from '../components/MapComponent';
import VenueFilters, { FilterOptions } from '../components/VenueFilters';
import { Venue } from '@/types';
import { filterVenues, extractCategories, extractTags } from '../utils/filterUtils';
import { toast } from "sonner";
import { PlacesService } from '../services/PlacesService';
import { Button } from '@/components/ui/button';

const MapView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    rating: 'all',
    category: 'all',
    tags: [],
  });
  
  // Venues state with loading and error handling
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [usingMockData, setUsingMockData] = useState(true);
  
  // Default to Sydney CBD
  const userLocation = { lat: -33.8688, lng: 151.2093 };

  // Fetch venues on initial load
  useEffect(() => {
    fetchVenues();
  }, []);
  
  // Function to fetch venues from Places API
  const fetchVenues = async (pageToken?: string) => {
    setIsLoading(true);
    
    try {
      const result = await PlacesService.searchNearbyVenues({
        location: userLocation,
        radius: 5000,
        type: "restaurant",
        pageToken: pageToken
      });
      
      if (result.venues.length === 0 && !pageToken) {
        // If no results and it's the initial fetch, fall back to mock data
        prepareMockData();
        setUsingMockData(true);
      } else if (result.venues.length > 0) {
        if (pageToken) {
          setVenues(prevVenues => [...prevVenues, ...result.venues]);
        } else {
          setVenues(result.venues);
        }
        setNextPageToken(result.nextPageToken);
        setUsingMockData(false);
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
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
      const venueVisits = mockVisits.filter(visit => visit.venueId === venue.id);
      
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
  };
  
  // Handle search submission
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await PlacesService.searchNearbyVenues({
        location: userLocation,
        radius: 5000,
        type: "restaurant",
        query: searchTerm
      });
      
      if (result.venues.length === 0) {
        toast("No venues found matching your search.");
      } else {
        setVenues(result.venues);
        setNextPageToken(result.nextPageToken);
        setUsingMockData(false);
      }
    } catch (error) {
      console.error("Error searching venues:", error);
      toast("Error searching venues. Showing mock data instead.");
      prepareMockData();
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter venues based on search term and filters
  const filteredBySearchVenues = venues.filter(venue => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return venue.name.toLowerCase().includes(searchTermLower) ||
           venue.address.toLowerCase().includes(searchTermLower) ||
           venue.category?.some(cat => cat.toLowerCase().includes(searchTermLower)) ||
           false;
  });
  
  // Apply additional filters
  const finalFilteredVenues = filterVenues(filteredBySearchVenues, filterOptions);
  
  // Extract unique categories and tags
  const categories = extractCategories(venues);
  const tags = extractTags(venues);
  
  // Handle venue selection
  const handleVenueSelect = (venueId: string) => {
    setSelectedVenue(venueId);
    
    // Scroll to the selected venue card if it exists
    const venueCard = document.getElementById(`venue-${venueId}`);
    if (venueCard) {
      venueCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // This would be replaced with actual check-in logic
  const handleCheckIn = () => {
    toast("Check-in feature coming soon!");
  };

  // Load more venues
  const handleLoadMore = () => {
    if (nextPageToken) {
      fetchVenues(nextPageToken);
    }
  };
  
  return (
    <div className="h-[calc(100vh-132px)] flex flex-col">
      {/* Search bar */}
      <div className="px-4 pt-4">
        <form 
          className="relative mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search Sydney venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-6 rounded-full"
          />
        </form>

        {/* Filters component */}
        <VenueFilters 
          onFilterChange={setFilterOptions}
          categories={categories}
          tags={tags}
        />
        
        {usingMockData && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
            Using mock data. Add a Google Places API key to fetch real Sydney venues.
          </div>
        )}
      </div>

      {/* Map area - 400vh height */}
      <div className="flex-grow h-[400vh] mx-4 mb-4 rounded-lg overflow-hidden border border-gray-200">
        <MapComponent 
          venues={finalFilteredVenues} 
          onVenueSelect={handleVenueSelect}
          userLocation={userLocation}
        />
      </div>

      {/* Venues list */}
      <div className="px-4 overflow-y-auto max-h-[30vh] pb-16">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Sydney Venues</h2>
          <span className="text-sm text-gray-500">
            {isLoading ? 'Loading...' : `${finalFilteredVenues.length} results`}
          </span>
        </div>
        
        {isLoading && finalFilteredVenues.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-visitvibe-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-500">Loading Sydney venues...</p>
          </div>
        ) : finalFilteredVenues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || (filterOptions.rating !== 'all' || filterOptions.category !== 'all' || (filterOptions.tags?.length || 0) > 0) ? (
              <p>No venues match your search or filters</p>
            ) : (
              <p>No venues found in this area</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finalFilteredVenues.map((venue) => (
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

      {/* Floating check-in button */}
      <CheckInButton 
        className="fixed right-6 bottom-24 w-14 h-14"
        onClick={handleCheckIn}
      />
    </div>
  );
};

export default MapView;
