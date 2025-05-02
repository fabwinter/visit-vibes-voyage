
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

const MapView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    rating: 'all',
    category: 'all',
    tags: [],
  });
  
  // Prepare data by merging the last visit into each venue
  const [venues, setVenues] = useState<Venue[]>([]);
  
  useEffect(() => {
    // Add the last visit to each venue for easier access
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
  }, []);
  
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

  // Default to Sydney CBD
  const userLocation = { lat: -33.8688, lng: 151.2093 };
  
  return (
    <div className="h-[calc(100vh-132px)] flex flex-col">
      {/* Search bar */}
      <div className="px-4 pt-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search Sydney venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-6 rounded-full"
          />
        </div>

        {/* Filters component */}
        <VenueFilters 
          onFilterChange={setFilterOptions}
          categories={categories}
          tags={tags}
        />
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
          <span className="text-sm text-gray-500">{finalFilteredVenues.length} results</span>
        </div>
        
        {finalFilteredVenues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || (filterOptions.rating !== 'all' || filterOptions.category !== 'all' || (filterOptions.tags?.length || 0) > 0) ? (
              <p>No venues match your search or filters</p>
            ) : (
              <p>No venues found in this area</p>
            )}
          </div>
        ) : (
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
