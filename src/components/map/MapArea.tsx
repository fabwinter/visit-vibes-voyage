
import { Button } from '@/components/ui/button';
import { Search, Map } from 'lucide-react';
import GoogleMapComponent from './GoogleMapComponent';
import MapComponent from './MapComponent';
import { Venue } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { SEARCH_RADIUS } from '@/services/places/config';
import { useMapProvider, MapProvider } from '@/hooks/useMapProvider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
  const { mapProvider, setMapProvider, googleApiKeyAvailable } = useMapProvider();
  
  const handleProviderChange = (value: string) => {
    if (value) {
      setMapProvider(value as MapProvider);
    }
  };
  
  return (
    <div className={`w-full ${isMobile ? 'h-full' : 'md:h-full md:order-1'} p-2 relative`}>
      {/* Map Provider Toggle */}
      <div className="absolute top-3 left-3 z-10">
        <ToggleGroup 
          type="single" 
          value={mapProvider} 
          onValueChange={handleProviderChange}
          className="bg-white border border-gray-200 rounded-md shadow-sm"
        >
          <ToggleGroupItem 
            value="google" 
            aria-label="Use Google Maps"
            disabled={!googleApiKeyAvailable}
            className={`text-xs px-2 py-1 ${!googleApiKeyAvailable ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            Google
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="mapbox" 
            aria-label="Use Mapbox"
            className="text-xs px-2 py-1"
          >
            Mapbox
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="h-full rounded-lg overflow-hidden border border-gray-200 shadow-md">
        {mapProvider === 'google' && googleApiKeyAvailable ? (
          <GoogleMapComponent 
            venues={venues} 
            onVenueSelect={onVenueSelect}
            userLocation={userLocation}
            selectedVenue={selectedVenue}
            onMapMove={onMapMove}
            className="w-full h-full"
            searchRadius={SEARCH_RADIUS}
            mapStyle="grayscale"
          />
        ) : (
          <MapComponent 
            venues={venues} 
            onVenueSelect={onVenueSelect}
            userLocation={userLocation}
            selectedVenue={selectedVenue}
            onMapMove={onMapMove}
            className="w-full h-full"
          />
        )}
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
