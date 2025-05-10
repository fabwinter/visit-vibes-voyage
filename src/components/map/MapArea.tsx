
import { Button } from '@/components/ui/button';
import { Search, Navigation } from 'lucide-react';
import MapComponent from '../MapComponent';
import { Venue } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface MapAreaProps {
  venues: Venue[];
  userLocation: { lat: number; lng: number };
  selectedVenue: string | null;
  showSearchThisArea: boolean;
  onVenueSelect: (venueId: string) => void;
  onMapMove: (center: { lat: number; lng: number }) => void;
  onSearchArea: () => void;
  onCenterToUserLocation?: () => void;
}

const MapArea = ({
  venues,
  userLocation,
  selectedVenue,
  showSearchThisArea,
  onVenueSelect,
  onMapMove,
  onSearchArea,
  onCenterToUserLocation
}: MapAreaProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="w-full md:w-1/2 lg:w-2/5 h-[250px] md:h-[400px] md:order-1 p-2 md:p-4 relative">
      <div className="h-full rounded-lg overflow-hidden border border-gray-200 shadow-md">
        <MapComponent 
          venues={venues} 
          onVenueSelect={onVenueSelect}
          userLocation={userLocation}
          selectedVenue={selectedVenue}
          className="w-full h-full"
          onMapMove={onMapMove}
        />
      </div>
      
      {/* Search this area button */}
      {showSearchThisArea && (
        <Button 
          onClick={onSearchArea}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-visitvibe-primary text-white shadow-lg flex items-center gap-1 py-1 px-3 h-9"
          size={isMobile ? "sm" : "default"}
        >
          <Search className="h-4 w-4" />
          {!isMobile && "Search this area"}
          {isMobile && "Search here"}
        </Button>
      )}

      {/* Center on my location button */}
      <Button
        onClick={onCenterToUserLocation}
        className="absolute bottom-4 right-4 z-10 bg-white text-visitvibe-primary border border-gray-200 shadow-lg hover:bg-gray-100"
        size="icon"
        title="Center on my location"
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapArea;
