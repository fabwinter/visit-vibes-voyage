
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, Camera } from 'lucide-react';
import StarRating from './StarRating';
import { Visit } from '../types';

interface VisitCardProps {
  visit: Visit;
  venueName: string;
  className?: string;
}

const VisitCard = ({ visit, venueName, className = '' }: VisitCardProps) => {
  const visitDate = new Date(visit.timestamp);

  return (
    <Link 
      to={`/visit/${visit.id}`}
      className={`block rounded-lg overflow-hidden shadow-md bg-white ${className}`}
    >
      <div className="relative h-48">
        {visit.photos.length > 0 ? (
          <img
            src={visit.photos[0]}
            alt={`Visit to ${venueName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Camera className="w-12 h-12 text-gray-300" />
          </div>
        )}
        
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <h3 className="text-white font-bold text-lg">{venueName}</h3>
          <div className="flex items-center text-white/90 text-sm">
            <Clock className="w-3 h-3 mr-1" />
            <time dateTime={visitDate.toISOString()}>
              {format(visitDate, 'MMM d, yyyy • h:mm a')}
            </time>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <StarRating rating={visit.rating.overall} className="justify-end" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-sm text-gray-500">Food</div>
            <StarRating rating={visit.rating.food} size="sm" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Service</div>
            <StarRating rating={visit.rating.service} size="sm" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Value</div>
            <StarRating rating={visit.rating.value} size="sm" />
          </div>
        </div>
        
        {visit.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {visit.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-badge">
                {tag}
              </span>
            ))}
            {visit.tags.length > 3 && (
              <span className="text-xs text-gray-500 self-end">
                +{visit.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default VisitCard;
