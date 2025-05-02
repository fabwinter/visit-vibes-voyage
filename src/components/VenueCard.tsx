
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import StarRating from './StarRating';
import { Venue, Visit } from '../types';

interface VenueCardProps {
  venue: Venue;
  lastVisit?: Visit;
  className?: string;
  onClick?: () => void; // Add this line to support onClick handlers
}

const VenueCard = ({ venue, lastVisit, className = '', onClick }: VenueCardProps) => {
  // Wrap the Link component with a div that handles the onClick
  return (
    <div onClick={onClick} className="cursor-pointer">
      <Link 
        to={`/venue/${venue.id}`}
        className={`block rounded-lg overflow-hidden shadow-md bg-white transition-transform hover:scale-[1.02] ${className}`}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault(); // Prevent navigation when used with onClick
            onClick();
          }
        }}
      >
        <div className="relative h-40">
          <img
            src={venue.photos[0] || 'https://placehold.co/600x400?text=No+Image'}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          
          {venue.priceLevel && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              {'$'.repeat(venue.priceLevel)}
            </div>
          )}
          
          {lastVisit && (
            <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Last visited: {new Date(lastVisit.timestamp).toLocaleDateString()}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold">{venue.name}</h3>
          
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="truncate">{venue.address}</span>
          </div>
          
          {lastVisit && (
            <div className="mt-2">
              <StarRating rating={lastVisit.rating.overall} size="md" />
            </div>
          )}
          
          {venue.category && (
            <div className="mt-3 flex flex-wrap gap-1">
              {venue.category.map((cat) => (
                <span key={cat} className="tag-badge">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default VenueCard;
