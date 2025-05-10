
import { MapPin } from 'lucide-react';

interface MapPlaceholderProps {
  className?: string;
  message?: string;
}

const MapPlaceholder = ({ className = '', message = 'Interactive map will be loaded here' }: MapPlaceholderProps) => {
  return (
    <div className={`w-full h-full bg-gray-100 flex items-center justify-center rounded-lg ${className}`}>
      <div className="text-center p-8">
        <MapPin className="w-12 h-12 mx-auto text-visitvibe-primary" />
        <p className="mt-2 text-gray-600">
          {message}
        </p>
      </div>
    </div>
  );
};

export default MapPlaceholder;
