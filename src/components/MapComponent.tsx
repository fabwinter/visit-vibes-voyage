
import { Venue } from '@/types';
import MapPlaceholder from './MapPlaceholder';

interface MapComponentProps {
  venues: Venue[];
  onVenueSelect: (venueId: string) => void;
  userLocation?: { lat: number; lng: number };
  selectedVenue?: string | null;
  className?: string;
  onMapMove?: (center: { lat: number; lng: number }) => void;
}

const MapComponent = ({ 
  venues, 
  onVenueSelect, 
  userLocation, 
  selectedVenue, 
  className
}: MapComponentProps) => {
  return (
    <MapPlaceholder 
      className={className}
      message="Interactive map will be loaded here using Google Maps Places API"
    />
  );
};

export default MapComponent;
