import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { filterVenues } from '../utils/filterUtils';
import CheckInButton from '../components/CheckInButton';
import CheckInForm from '../components/CheckInForm';
import { FilterOptions } from '../components/VenueFilters';
import { Venue } from '@/types';
import { toast } from "sonner";
import { useIsMobile } from '../hooks/use-mobile';
import EnhancedVenueCard from '../components/EnhancedVenueCard';

// Import refactored components
import SearchBar from '../components/map/SearchBar';
import VenueList from '../components/map/VenueList';
import MapArea from '../components/map/MapArea';
import SelectedVenueDetails from '../components/map/SelectedVenueDetails';
import { useVenues } from '../hooks/useVenues';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowUp, MapPin } from "lucide-react";
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
  
  // Use our custom hook for venue and location management
  const {
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
    handleVenueSelect,
    handleLoadMore,
    processCheckIn,
    selectedVenue,
    selectedVenueDetails,
    surroundingVenues
  } = useVenues();
  
  // UI state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [showVenueSheet, setShowVenueSheet] = useState(false);
  const [pendingAction, setPendingAction] = useState<{type: string, venue: Venue} | null>(null);
  const isMobile = useIsMobile();

  // Check if we need to select a venue from navigation state
  useEffect(() => {
    if (location.state?.selectedVenueId) {
      handleVenueSelect(location.state.selectedVenueId);
    }
  }, [location.state]);
  
  // Apply additional filters
  const filteredVenues = filterVenues(venues, filterOptions);

  // Handle check-in with authentication check
  const handleCheckIn = (venueToCheckIn?: Venue) => {
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
  
  // Process check-in and close dialog
  const handleProcessCheckIn = (visit: any) => {
    processCheckIn(visit);
    setIsCheckInOpen(false);
  };

  // Close venue details sheet
  const handleCloseVenueSheet = () => {
    setShowVenueSheet(false);
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
  }, [isAuthenticated, pendingAction]);

  return (
    <div className="flex flex-col h-[calc(100vh-132px)] md:flex-row">
      {/* Map Area - Takes full width on mobile, left side on desktop */}
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
      
      {/* Search and Venue List - Below map on mobile, right side on desktop */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col md:h-full md:overflow-y-auto p-4">
        {/* Search with filters */}
        <SearchBar
          venues={venues}
          userLocation={userLocation}
          onFilterChange={setFilterOptions}
          onPlaceSelect={handlePlaceSelect}
          className="mb-4"
        />
        
        {/* Selected venue details on desktop */}
        {!isMobile && selectedVenueDetails && (
          <SelectedVenueDetails
            venue={selectedVenueDetails}
            onCheckIn={handleCheckIn}
            onClose={() => handleVenueSelect('')}
          />
        )}
        
        {/* List toggle for mobile - could expand this into a sheet/drawer */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                className="mb-2 w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex justify-between items-center"
                variant="outline"
              >
                <span>View All Venues ({filteredVenues.length})</span>
                <ArrowUp className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] pt-6">
              <SheetHeader>
                <SheetTitle>Food Venues</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4">
                <VenueList
                  venues={filteredVenues}
                  isLoading={isLoading}
                  usingMockData={usingMockData}
                  selectedVenue={selectedVenue}
                  nextPageToken={nextPageToken}
                  onVenueSelect={handleVenueSelect}
                  onLoadMore={handleLoadMore}
                  onCheckIn={handleCheckIn}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
        
        {/* Always show venue list on desktop, or on mobile if not in sheet mode */}
        {(!isMobile || !showVenueSheet) && (
          <div className={`${isMobile ? 'max-h-[35vh] overflow-y-auto' : ''}`}>
            {/* Show selected venue at the top if available */}
            {selectedVenueDetails && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Selected Venue</h2>
                <div 
                  key={selectedVenueDetails.id}
                  id={`venue-${selectedVenueDetails.id}`}
                  className="transition-all duration-200 ring-2 ring-visitvibe-primary ring-offset-2"
                  onClick={() => handleVenueSelect(selectedVenueDetails.id)}
                >
                  <EnhancedVenueCard
                    venue={selectedVenueDetails}
                    lastVisit={selectedVenueDetails.lastVisit}
                    onClick={() => handleVenueSelect(selectedVenueDetails.id)}
                    onCheckIn={handleCheckIn}
                  />
                </div>
              </div>
            )}
            
            {/* Show nearby venues if available */}
            {surroundingVenues.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 mr-1 text-visitvibe-primary" />
                  <h2 className="text-lg font-semibold">Nearby Places</h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {surroundingVenues.map(venue => (
                    <div 
                      key={venue.id}
                      id={`venue-${venue.id}`}
                      className="transition-all duration-200"
                      onClick={() => handleVenueSelect(venue.id)}
                    >
                      <EnhancedVenueCard
                        venue={venue}
                        lastVisit={venue.lastVisit}
                        onClick={() => handleVenueSelect(venue.id)}
                        onCheckIn={handleCheckIn}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* All venues list */}
            <VenueList
              venues={filteredVenues.filter(v => 
                v.id !== selectedVenueDetails?.id && 
                !surroundingVenues.some(sv => sv.id === v.id)
              )}
              isLoading={isLoading}
              usingMockData={usingMockData}
              selectedVenue={selectedVenue}
              nextPageToken={nextPageToken}
              onVenueSelect={handleVenueSelect}
              onLoadMore={handleLoadMore}
              onCheckIn={handleCheckIn}
              useEnhancedCard={true}
            />
          </div>
        )}
      </div>

      {/* Bottom sheet for selected venue on mobile */}
      {isMobile && selectedVenueDetails && (
        <Sheet open={showVenueSheet} onOpenChange={setShowVenueSheet}>
          <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto">
            <SheetHeader className="mb-2">
              <SheetTitle>{selectedVenueDetails.name}</SheetTitle>
            </SheetHeader>
            <SelectedVenueDetails
              venue={selectedVenueDetails}
              onCheckIn={handleCheckIn}
              onClose={handleCloseVenueSheet}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Floating check-in button - adjusted position for mobile */}
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
