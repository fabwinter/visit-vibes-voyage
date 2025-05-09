
import { Button } from '@/components/ui/button';
import { Search, Navigation } from 'lucide-react';
import { Venue } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import MapPlaceholder from '../MapPlaceholder';

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
  onSearchArea,
  onCenterToUserLocation
}: MapAreaProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="w-full md:w-1/2 lg:w-2/5 h-[250px] md:h-[400px] md:order-1 p-2 md:p-4 relative">
      <div className="h-full rounded-lg overflow-hidden border border-gray-200 shadow-md">
        <MapPlaceholder className="rounded-lg" />
        
        {/* Simple venue list overlay */}
        {venues.length > 0 && (
          <div className="absolute bottom-14 left-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-md max-h-28 overflow-y-auto shadow-md">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-medium">Places</h3>
              <span className="text-xs text-gray-500">{venues.length} nearby</span>
            </div>
            <div>
              {venues.slice(0, 5).map((venue) => (
                <button
                  key={venue.id}
                  className={`text-xs text-left block w-full truncate px-2 py-1 rounded ${
                    selectedVenue === venue.id ? 'bg-visitvibe-primary text-white' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onVenueSelect(venue.id)}
                >
                  {venue.name}
                </button>
              ))}
            </div>
          </div>
        )}
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
