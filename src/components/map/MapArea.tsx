
import { Button } from '@/components/ui/button';
import { Search, Navigation, MapPin } from 'lucide-react';
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
    <div className="w-full md:w-1/2 lg:w-2/5 h-[300px] md:h-[500px] md:order-1 p-2 md:p-4 relative">
      <div className="h-full rounded-xl overflow-hidden border border-gray-200 shadow-lg">
        <MapComponent 
          venues={venues} 
          onVenueSelect={onVenueSelect}
          userLocation={userLocation}
          selectedVenue={selectedVenue}
          onMapMove={onMapMove}
          className="w-full h-full"
        />
      </div>
      
      {/* Map overlay header with logo */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-md">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/facf83df-7352-4bf9-a188-0c877403dcc1.png" 
            alt="MunchMapper" 
            className="w-6 h-6"
          />
          <span className="font-semibold text-sm text-gray-800">Food Spots {venues.length > 0 ? `(${venues.length})` : ''}</span>
        </div>
      </div>
      
      {/* Search this area button with visual enhancement */}
      {showSearchThisArea && (
        <Button 
          onClick={onSearchArea}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white text-gray-800 border border-gray-200 shadow-lg hover:bg-gray-50 flex items-center gap-1 py-1 px-3 h-9 transition-all duration-300 animate-pulse"
          size={isMobile ? "sm" : "default"}
        >
          <Search className="h-4 w-4 text-rose-500" />
          <span className="text-sm font-medium" style={{ color: '#ff4d94' }}>
            {!isMobile ? "Search this area" : "Search here"}
          </span>
        </Button>
      )}

      {/* Bottom control panel */}
      <div className="absolute bottom-8 right-6 z-10 flex flex-col gap-2">
        {/* Center on my location button */}
        <Button
          onClick={onCenterToUserLocation}
          className="bg-white text-gray-800 border border-gray-200 shadow-lg hover:bg-gray-50 transition-all"
          size="icon"
          title="Center on my location"
        >
          <Navigation className="h-4 w-4 text-blue-500" />
        </Button>
        
        {/* Toggle 3D buildings button */}
        <Button
          className="bg-white text-gray-800 border border-gray-200 shadow-lg hover:bg-gray-50 transition-all"
          size="icon"
          title="Toggle map view"
        >
          <MapPin className="h-4 w-4 text-rose-500" />
        </Button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-8 left-6 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-md border border-gray-200 hidden md:block">
        <div className="text-xs font-medium mb-1">Map Legend</div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff4d94' }}></div>
          <span>Unrated</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Good Rating</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Average Rating</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Poor Rating</span>
        </div>
      </div>
    </div>
  );
};

export default MapArea;
