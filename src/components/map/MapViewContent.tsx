
import React from 'react';
import { Venue } from '@/types';
import { FilterOptions } from '@/components/VenueFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import EnhancedVenueCard from '@/components/EnhancedVenueCard';
import VenueList from '@/components/map/VenueList';
import SelectedVenueDetails from '@/components/map/SelectedVenueDetails';
import { ArrowUp, MapPin } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface MapViewContentProps {
  venues: Venue[];
  filteredVenues: Venue[];
  selectedVenue: string | null;
  selectedVenueDetails: Venue | null;
  surroundingVenues: Venue[];
  isLoading: boolean;
  usingMockData: boolean;
  nextPageToken: string | null;
  showVenueSheet: boolean;
  setShowVenueSheet: (show: boolean) => void;
  handleVenueSelect: (venueId: string) => void;
  handleCheckIn: (venue?: Venue) => void;
  handleLoadMore: () => void;
  handleCloseVenueSheet: () => void;
}

const MapViewContent: React.FC<MapViewContentProps> = ({
  venues,
  filteredVenues,
  selectedVenue,
  selectedVenueDetails,
  surroundingVenues,
  isLoading,
  usingMockData,
  nextPageToken,
  showVenueSheet,
  setShowVenueSheet,
  handleVenueSelect,
  handleCheckIn,
  handleLoadMore,
  handleCloseVenueSheet
}) => {
  const isMobile = useIsMobile();
  
  // Render the mobile venue list toggle
  const renderMobileVenueListToggle = () => {
    if (!isMobile) return null;
    
    return (
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
              useEnhancedCard={true}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  };
  
  // Render the selected venue
  const renderSelectedVenue = () => {
    if (!selectedVenueDetails) return null;
    
    return (
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Selected Venue</h2>
        <div 
          key={selectedVenueDetails.id}
          id={`venue-${selectedVenueDetails.id}`}
          className="transition-all duration-200 ring-2 ring-visitvibe-primary ring-offset-2"
        >
          <EnhancedVenueCard
            venue={selectedVenueDetails}
            lastVisit={selectedVenueDetails.lastVisit}
            onClick={() => handleVenueSelect(selectedVenueDetails.id)}
            onCheckIn={() => handleCheckIn(selectedVenueDetails)}
          />
        </div>
      </div>
    );
  };
  
  // Render nearby venues
  const renderNearbyVenues = () => {
    if (!surroundingVenues.length) return null;
    
    return (
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
            >
              <EnhancedVenueCard
                venue={venue}
                lastVisit={venue.lastVisit}
                onClick={() => handleVenueSelect(venue.id)}
                onCheckIn={() => handleCheckIn(venue)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render the full venue list content
  const renderVenueListContent = () => {
    if (isMobile && showVenueSheet) return null;
    
    return (
      <div className={isMobile ? 'max-h-[35vh] overflow-y-auto' : ''}>
        {/* Selected venue at the top if available */}
        {selectedVenueDetails && renderSelectedVenue()}
        
        {/* Nearby venues if available */}
        {surroundingVenues.length > 0 && renderNearbyVenues()}
        
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
    );
  };
  
  // Render mobile venue details sheet
  const renderMobileVenueDetails = () => {
    if (!isMobile || !selectedVenueDetails) return null;
    
    return (
      <Sheet open={showVenueSheet} onOpenChange={setShowVenueSheet}>
        <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto">
          <SheetHeader className="mb-2">
            <SheetTitle>{selectedVenueDetails.name}</SheetTitle>
          </SheetHeader>
          <SelectedVenueDetails
            venue={selectedVenueDetails}
            onCheckIn={() => handleCheckIn(selectedVenueDetails)}
            onClose={handleCloseVenueSheet}
          />
        </SheetContent>
      </Sheet>
    );
  };
  
  return (
    <>
      {/* Mobile venue list toggle */}
      {renderMobileVenueListToggle()}
      
      {/* Venue list content */}
      {renderVenueListContent()}
      
      {/* Mobile bottom sheet for selected venue */}
      {renderMobileVenueDetails()}
    </>
  );
};

export default MapViewContent;
