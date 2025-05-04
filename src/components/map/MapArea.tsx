
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import GoogleMapComponent from './GoogleMapComponent';
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
}

const MapArea = ({
  venues,
  userLocation,
  selectedVenue,
  showSearchThisArea,
  onVenueSelect,
  onMapMove,
  onSearchArea
}: MapAreaProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`w-full ${isMobile ? 'h-full' : 'md:h-full md:order-1'} p-2 relative`}>
      <div className="h-full rounded-lg overflow-hidden border border-gray-200 shadow-md">
        <GoogleMapComponent 
          venues={venues} 
          onVenueSelect={onVenueSelect}
          userLocation={userLocation}
          selectedVenue={selectedVenue}
          onMapMove={onMapMove}
          className="w-full h-full"
        />
      </div>
      
      {/* Search this area button */}
      {showSearchThisArea && (
        <Button 
          onClick={onSearchArea}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-visitvibe-primary text-white shadow-lg flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Search this area
        </Button>
      )}
    </div>
  );
};

export default MapArea;
