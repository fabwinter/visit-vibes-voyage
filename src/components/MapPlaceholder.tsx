
import { MapPin } from 'lucide-react';

interface MapPlaceholderProps {
  className?: string;
}

const MapPlaceholder = ({ className = '' }: MapPlaceholderProps) => {
  return (
    <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
      <div className="text-center p-8">
        <MapPin className="w-12 h-12 mx-auto text-visitvibe-primary" />
        <p className="mt-2 text-gray-600">
          Interactive map will be loaded here<br />
          <span className="text-sm">Coming soon in the next version!</span>
        </p>
      </div>
    </div>
  );
};

export default MapPlaceholder;
