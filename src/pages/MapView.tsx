
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
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const MapView = () => {
  const location = useLocation();
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
    usingMockData,
    nextPageToken,
    showSearchThisArea,
    setMapCenter,
    handleMapMove,
    handleSearchThisArea,
    handlePlaceSelect,
    handleLoadMore,
    processCheckIn
  } = useVenues();
  
  // UI state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedVenueDetails, setSelectedVenueDetails] = useState<Venue | null>(null);
  const [showVenueSheet, setShowVenueSheet] = useState(false);
  const isMobile = useIsMobile();

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
        
        // Open bottom sheet on mobile
        if (isMobile) {
          setShowVenueSheet(true);
        }
      } else {
        // Fetch details if not in our current list
        try {
          const { PlacesService } = await import('../services/PlacesService');
          const details = await PlacesService.getVenueDetails(venueId);
          if (details) {
            setSelectedVenueDetails(details);
            // Center map on selected venue
            setMapCenter(details.coordinates);
            
            // Open bottom sheet on mobile
            if (isMobile) {
              setShowVenueSheet(true);
            }
          }
        } catch (error) {
          console.error("Error fetching venue details:", error);
        }
      }
    } else if (isMobile) {
      // If already selected, just toggle the sheet
      setShowVenueSheet(true);
    }
    
    // Scroll to the selected venue card if it exists and we're not on mobile
    if (!isMobile) {
      const venueCard = document.getElementById(`venue-${venueId}`);
      if (venueCard) {
        venueCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  // Handle check-in
  const handleCheckIn = () => {
    if (selectedVenueDetails) {
      setIsCheckInOpen(true);
      setShowVenueSheet(false); // Close sheet when opening check-in form
    } else {
      toast.error("Please select a venue first");
    }
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

  return (
    <div className="flex flex-col h-[calc(100vh-132px)] md:flex-row">
      {/* Map Area - Takes full width on mobile, left side on desktop */}
      <div className={`${isMobile ? 'h-[50vh]' : ''} w-full md:w-1/2 lg:w-3/5 md:h-full`}>
        <MapArea
          venues={filteredVenues}
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
            onCheckIn={() => handleCheckIn()}
            onClose={() => setSelectedVenueDetails(null)}
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
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
        
        {/* Always show venue list on desktop, or on mobile if not in sheet mode */}
        {(!isMobile || !showVenueSheet) && (
          <div className={`${isMobile ? 'max-h-[35vh] overflow-y-auto' : ''}`}>
            <VenueList
              venues={filteredVenues}
              isLoading={isLoading}
              usingMockData={usingMockData}
              selectedVenue={selectedVenue}
              nextPageToken={nextPageToken}
              onVenueSelect={handleVenueSelect}
              onLoadMore={handleLoadMore}
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
              onCheckIn={() => handleCheckIn()}
              onClose={handleCloseVenueSheet}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Floating check-in button - adjusted position for mobile */}
      <CheckInButton 
        className={`fixed ${isMobile ? 'right-4 bottom-20' : 'right-6 bottom-24'} w-14 h-14`}
        onClick={handleCheckIn}
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
    </div>
  );
};

export default MapView;
