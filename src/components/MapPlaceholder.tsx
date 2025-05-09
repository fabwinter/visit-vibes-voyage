
import { MapPin, Map } from 'lucide-react';

interface MapPlaceholderProps {
  className?: string;
}

const MapPlaceholder = ({ className = '' }: MapPlaceholderProps) => {
  return (
    <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
      <div className="text-center p-8">
        <div className="flex justify-center items-center mb-3">
          <Map className="w-8 h-8 text-visitvibe-primary mr-2" />
          <MapPin className="w-12 h-12 text-visitvibe-primary" />
        </div>
        <h3 className="font-medium text-lg mb-1">Map View Simplified</h3>
        <p className="mt-2 text-gray-600">
          Using Foursquare data<br />
          <span className="text-sm">Map visualization temporarily disabled</span>
        </p>
        <p className="text-xs text-gray-500 mt-3">
          Venues are still fully functional.<br />
          Select from the list on the side.
        </p>
      </div>
    </div>
  );
};

export default MapPlaceholder;
