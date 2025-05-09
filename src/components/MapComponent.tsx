
import { Venue } from '@/types';
import MapPlaceholder from './MapPlaceholder';

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
  selectedVenue, 
  className,
  onMapMove 
}: MapComponentProps) => {
  // Using our map placeholder component
  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapPlaceholder className="rounded-lg" />
      
      {/* Only show a counter indicator with number of venues */}
      {venues.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-visitvibe-primary text-white px-3 py-1 rounded-full shadow-md text-sm font-medium">
          {venues.length} venues
        </div>
      )}
    </div>
  );
};

export default MapComponent;
