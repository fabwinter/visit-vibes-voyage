
import MapComponent from '../MapComponent';
import { Venue } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { useRef, useState } from 'react';

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
  const [mapHeight, setMapHeight] = useState<'small' | 'medium' | 'large'>(isMobile ? 'medium' : 'large');
  const dragStartY = useRef<number>(0);

  // Get the map height based on current size setting
  const getHeightClass = () => {
    switch (mapHeight) {
      case 'small':
        return 'h-[180px]';
      case 'medium':
        return 'h-[250px]';
      case 'large':
        return 'h-[50vh]';
      default:
        return 'h-[250px]';
    }
  };

  // Handle touch start event
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  // Handle touch move event
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent page scrolling
  };

  // Handle touch end event
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dragEndY = e.changedTouches[0].clientY;
    const dragDiff = dragEndY - dragStartY.current;
    
    // Swipe up - increase map size
    if (dragDiff < -50) {
      if (mapHeight === 'small') setMapHeight('medium');
      else if (mapHeight === 'medium') setMapHeight('large');
    }
    // Swipe down - decrease map size
    else if (dragDiff > 50) {
      if (mapHeight === 'large') setMapHeight('medium');
      else if (mapHeight === 'medium') setMapHeight('small');
    }
  };

  return (
    <div 
      className={`w-full md:w-1/2 lg:w-2/5 ${getHeightClass()} md:h-[400px] md:order-1 p-2 md:p-4 relative transition-all duration-300`}
    >
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
        <button 
          onClick={onSearchArea}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-visitvibe-primary text-white shadow-lg flex items-center gap-1 py-1 px-3 h-9 rounded-md"
        >
          {!isMobile && "Search this area"}
          {isMobile && "Search here"}
        </button>
      )}

      {/* Map resize control for mobile */}
      {isMobile && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-8 bg-white/80 backdrop-blur-sm flex justify-center items-center border-t border-gray-200 cursor-grab touch-pan-y z-10"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex flex-col items-center">
            <ChevronUp className="h-4 w-4 text-gray-500" />
            <div className="w-16 h-1 bg-gray-300 rounded-full my-1"></div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      )}

      {/* Center to user location button */}
      {onCenterToUserLocation && (
        <button
          onClick={onCenterToUserLocation}
          className="absolute top-3 right-3 z-10 bg-white shadow-md rounded-full p-2"
          aria-label="Center to my location"
        >
          <MapPin className="h-5 w-5 text-visitvibe-primary" />
        </button>
      )}
    </div>
  );
};

export default MapArea;
