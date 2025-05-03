
import { Venue } from '@/types';
import MapBox from './MapBox';

interface MapComponentProps {
  venues: Venue[];
  onVenueSelect: (venueId: string) => void;
  userLocation?: { lat: number; lng: number };
  mapboxToken?: string;
  selectedVenue?: string | null;
  className?: string;
  onMapMove?: (center: { lat: number; lng: number }) => void;
}

const MapComponent = ({ 
  venues, 
  onVenueSelect, 
  userLocation, 
  mapboxToken, 
  selectedVenue, 
  className,
  onMapMove 
}: MapComponentProps) => {
  return (
    <MapBox 
      venues={venues}
      onVenueSelect={onVenueSelect}
      userLocation={userLocation}
      mapboxToken={mapboxToken}
      selectedVenue={selectedVenue}
      className={className}
      onMapMove={onMapMove}
    />
  );
};

export default MapComponent;
