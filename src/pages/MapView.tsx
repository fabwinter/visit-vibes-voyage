
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { filterVenues } from '../utils/filterUtils';
import CheckInButton from '../components/CheckInButton';
import CheckInForm from '../components/CheckInForm';
import { FilterOptions } from '../components/VenueFilters';
import { Venue } from '@/types';
import { toast } from "sonner";
import { useIsMobile } from '../hooks/use-mobile';

// Import refactored components
import SearchBar from '../components/map/SearchBar';
import VenueList from '../components/map/VenueList';
import MapArea from '../components/map/MapArea';
import SelectedVenueDetails from '../components/map/SelectedVenueDetails';
import { useVenues } from '../hooks/useVenues';

const MapView = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    rating: 'all',
    category: 'all',
    tags: [],
  });
  
  // Use our custom hook for venue and location management
  const {
    venues,
    userLocation,
    isLoading,
    showSearchThisArea,
    setMapCenter,
    handleMapMove,
    handleSearchThisArea,
    handlePlaceSelect,
    processCheckIn,
    centerToUserLocation
  } = useVenues();
  
  // UI state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedVenueDetails, setSelectedVenueDetails] = useState<Venue | null>(null);

  // Check if we need to select a venue from navigation state
  useEffect(() => {
    if (location.state?.selectedVenueId) {
      setSelectedVenue(location.state.selectedVenueId);
    }
  }, [location.state]);
  
  // Apply additional filters
  const filteredVenues = filterVenues(venues, filterOptions);

  // Handle venue selection from map or list
  const handleVenueSelect = async (venueId: string) => {
    setSelectedVenue(venueId);
    
    // Get venue details if not already selected
    if (!selectedVenueDetails || selectedVenueDetails.id !== venueId) {
      const venue = venues.find(v => v.id === venueId);
      
      if (venue) {
        setSelectedVenueDetails(venue);
        // Center map on selected venue
        setMapCenter(venue.coordinates);
      } else {
        // Fetch details if not in our current list
        try {
          const { PlacesService } = await import('../services/PlacesService');
          const details = await PlacesService.getVenueDetails(venueId);
          if (details) {
            setSelectedVenueDetails(details);
            // Center map on selected venue
            setMapCenter(details.coordinates);
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
  const handleCheckIn = (venue?: Venue) => {
    if (venue) {
      setSelectedVenue(venue.id);
      setSelectedVenueDetails(venue);
      setIsCheckInOpen(true);
    } else if (selectedVenueDetails) {
      setIsCheckInOpen(true);
    } else {
      toast.error("Please select a venue first");
    }
  };
  
  // Process check-in and close dialog
  const handleProcessCheckIn = (visit: any) => {
    processCheckIn(visit);
    setIsCheckInOpen(false);
  };
  
  // Close selected venue details
  const handleCloseVenueDetails = () => {
    setSelectedVenueDetails(null);
    setSelectedVenue(null);
  };

  return (
    <div className={`h-[calc(100vh-132px)] flex flex-col md:flex-row`}>
      {/* Map Area - reduced height on mobile */}
      <MapArea
        venues={filteredVenues}
        userLocation={userLocation}
        selectedVenue={selectedVenue}
        showSearchThisArea={showSearchThisArea}
        onVenueSelect={handleVenueSelect}
        onMapMove={handleMapMove}
        onSearchArea={handleSearchThisArea}
        onCenterToUserLocation={centerToUserLocation}
      />
      
      {/* Right side - Search, Filters and Venue List */}
      <div className="w-full md:w-1/2 lg:w-3/5 md:h-full md:overflow-y-auto p-3 md:p-4 md:order-2 flex-1">
        {/* Search with filters */}
        <SearchBar
          venues={venues}
          userLocation={userLocation}
          onFilterChange={setFilterOptions}
          onPlaceSelect={handlePlaceSelect}
          className="mb-3"
        />
        
        {/* Selected venue details if available */}
        {selectedVenueDetails && (
          <SelectedVenueDetails
            venue={selectedVenueDetails}
            onClose={handleCloseVenueDetails}
            onCheckIn={handleCheckIn}
          />
        )}
        
        {/* Venues list */}
        <VenueList
          venues={filteredVenues}
          isLoading={isLoading}
          usingMockData={false}
          selectedVenue={selectedVenue}
          onVenueSelect={handleVenueSelect}
          onLoadMore={() => {}}
          onCheckInClick={(venue) => handleCheckIn(venue)}
        />
      </div>

      {/* Floating check-in button - only show if no venue is selected on mobile */}
      {isMobile && !selectedVenueDetails && (
        <CheckInButton 
          className="fixed right-4 bottom-20 w-12 h-12 shadow-lg"
          onClick={() => handleCheckIn()}
        />
      )}

      {/* Check-in form dialog */}
      {selectedVenueDetails && (
        <CheckInForm
          venue={selectedVenueDetails}
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          onCheckIn={handleProcessCheckIn}
        />
      )}
    </div>
  );
};

export default MapView;
