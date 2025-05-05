
import { Button } from '@/components/ui/button';
import { Search, Navigation } from 'lucide-react';
import MapComponent from '../MapComponent';
import { Venue } from '@/types';

interface MapAreaProps {
  venues: Venue[];
  userLocation: { lat: number; lng: number };
  selectedVenue: string | null;
  showSearchThisArea: boolean;
  onVenueSelect: (venueId: string) => void;
  onMapMove: (center: { lat: number; lng: number }) => void;
  onSearchArea: () => void;
  onCenterToUserLocation?: () => void; // New prop for centering on user location
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
  return (
    <div className="w-full md:w-1/2 lg:w-3/5 h-[350px] md:h-full md:order-1 p-4 relative">
      <div className="h-full rounded-lg overflow-hidden border border-gray-200 shadow-md">
        <MapComponent 
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

      {/* Center on my location button */}
      <Button
        onClick={onCenterToUserLocation}
        className="absolute bottom-6 right-6 z-10 bg-white text-visitvibe-primary border border-gray-200 shadow-lg hover:bg-gray-100"
        size="icon"
        title="Center on my location"
      >
        <Navigation className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MapArea;
