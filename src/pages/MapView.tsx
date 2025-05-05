
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { filterVenues } from '../utils/filterUtils';
import CheckInButton from '../components/CheckInButton';
import CheckInForm from '../components/CheckInForm';
import { FilterOptions } from '../components/VenueFilters';
import { toast } from "sonner";
import { useIsMobile } from '../hooks/use-mobile';

// Import refactored components
import SearchBar from '../components/map/SearchBar';
import MapArea from '../components/map/MapArea';
import MapViewContent from '../components/map/MapViewContent';
import SelectedVenueDetails from '../components/map/SelectedVenueDetails';
import { useVenues } from '../hooks/useVenues';
import AuthModal from '@/components/auth/AuthModal';
import { useAuthContext } from '@/hooks/useAuthContext';

const MapView = () => {
  const location = useLocation();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    rating: 'all',
    category: 'all',
    tags: [],
  });
  const { isAuthenticated, showAuthModal, setShowAuthModal } = useAuthContext();
  const isMobile = useIsMobile();
  
  // UI state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [showVenueSheet, setShowVenueSheet] = useState(false);
  
  // Use our custom hook for venue management
  const {
    venues,
    userLocation,
    isLoading,
    usingMockData,
    nextPageToken,
    showSearchThisArea,
    handleMapMove,
    handleSearchThisArea,
    handlePlaceSelect,
    handleVenueSelect,
    handleLoadMore,
    selectedVenue,
    selectedVenueDetails,
    surroundingVenues,
    pendingAction,
    setPendingAction,
    processCheckIn
  } = useVenues();
  
  // Log initial setup
  useEffect(() => {
    console.log("MapView loaded, venues:", venues.length, "userLocation:", userLocation);
  }, [venues, userLocation]);
  
  // Updated wrapper function to handle both types correctly
  const handlePlaceSelection = (placeOrVenue: google.maps.places.PlaceResult | any) => {
    console.log("handlePlaceSelection called with:", placeOrVenue);
    
    if ('place_id' in placeOrVenue && placeOrVenue.place_id) {
      // It's a Google Place
      console.log("Handling as PlaceResult");
      handlePlaceSelect(placeOrVenue as google.maps.places.PlaceResult);
    } else if ('id' in placeOrVenue) {
      // It's a Venue
      console.log("Handling as Venue");
      handleVenueSelect(placeOrVenue.id);
    } else {
      console.error("Received object with neither place_id nor id:", placeOrVenue);
      toast.error("Invalid place data received");
    }
  };
  
  // Check if we need to select a venue from navigation state
  useEffect(() => {
    if (location.state?.selectedVenueId) {
      handleVenueSelect(location.state.selectedVenueId);
    }
  }, [location.state, handleVenueSelect]);
  
  // Apply additional filters
  const filteredVenues = filterVenues(venues, filterOptions);
  
  // Handle check-in with authentication check
  const handleCheckIn = (venueToCheckIn?: any) => {
    const venue = venueToCheckIn || selectedVenueDetails;
    
    if (!venue) {
      toast.error("Please select a venue first");
      return;
    }
    
    if (!isAuthenticated) {
      setPendingAction({
        type: 'check-in',
        venue: venue
      });
      setShowAuthModal(true);
      return;
    }
    
    setIsCheckInOpen(true);
    setShowVenueSheet(false); // Close sheet when opening check-in form
  };
  
  // Handle actions after authentication
  useEffect(() => {
    if (isAuthenticated && pendingAction) {
      if (pendingAction.type === 'check-in') {
        setIsCheckInOpen(true);
        setShowVenueSheet(false);
      }
      
      // Clear pending action
      setPendingAction(null);
    }
  }, [isAuthenticated, pendingAction, setPendingAction]);

  // Process check-in and close dialog
  const handleProcessCheckIn = (visit: any) => {
    processCheckIn(visit);
    setIsCheckInOpen(false);
  };

  // Close venue details sheet
  const handleCloseVenueSheet = () => {
    setShowVenueSheet(false);
  };

  // Show error if venues failed to load
  useEffect(() => {
    if (!isLoading && venues.length === 0 && userLocation.lat !== 0) {
      toast.info("No venues found in this area. Try searching in a different location.");
    }
  }, [venues, isLoading, userLocation]);

  return (
    <div className="flex flex-col h-[calc(100vh-132px)] md:flex-row">
      {/* Map Area */}
      <div className={`${isMobile ? 'h-[50vh]' : ''} w-full md:w-1/2 lg:w-3/5 md:h-full`}>
        <MapArea
          venues={venues}
          userLocation={userLocation}
          selectedVenue={selectedVenue}
          showSearchThisArea={showSearchThisArea}
          onVenueSelect={handleVenueSelect}
          onMapMove={handleMapMove}
          onSearchArea={handleSearchThisArea}
        />
      </div>
      
      {/* Search and Venue List */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col md:h-full md:overflow-y-auto p-4">
        {/* Search with filters */}
        <SearchBar
          venues={venues}
          userLocation={userLocation}
          onFilterChange={setFilterOptions}
          onPlaceSelect={handlePlaceSelection}
          className="mb-4"
        />
        
        {/* Selected venue details on desktop */}
        {!isMobile && selectedVenueDetails && (
          <SelectedVenueDetails
            venue={selectedVenueDetails}
            onCheckIn={() => handleCheckIn(selectedVenueDetails)}
            onClose={() => handleVenueSelect('')}
          />
        )}
        
        {/* Venue List Content - using our refactored component */}
        <MapViewContent 
          venues={venues}
          filteredVenues={filteredVenues}
          selectedVenue={selectedVenue}
          selectedVenueDetails={selectedVenueDetails}
          surroundingVenues={surroundingVenues}
          isLoading={isLoading}
          usingMockData={usingMockData}
          nextPageToken={nextPageToken}
          showVenueSheet={showVenueSheet}
          setShowVenueSheet={setShowVenueSheet}
          handleVenueSelect={handleVenueSelect}
          handleCheckIn={handleCheckIn}
          handleLoadMore={handleLoadMore}
          handleCloseVenueSheet={handleCloseVenueSheet}
        />
      </div>

      {/* Floating check-in button */}
      <CheckInButton 
        className={`fixed ${isMobile ? 'right-4 bottom-20' : 'right-6 bottom-24'} w-14 h-14`}
        onClick={() => handleCheckIn()}
      />

      {/* Check-in form dialog */}
      {selectedVenueDetails && (
        <CheckInForm
          venue={selectedVenueDetails}
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          onCheckIn={handleProcessCheckIn}
        />
      )}
      
      {/* Authentication modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default MapView;
