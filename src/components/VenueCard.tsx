
import React from 'react';
import { Venue, Visit } from '@/types';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, Phone, Globe, MapPin, Star } from 'lucide-react';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';

interface VenueCardProps {
  venue: Venue;
  lastVisit?: Visit;
  onClick?: () => void;
  className?: string;
}

const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  lastVisit,
  onClick,
  className
}) => {
  // Format visit date as "X days/months ago"
  const getLastVisitText = () => {
    if (!lastVisit) return null;
    
    try {
      return formatDistanceToNow(new Date(lastVisit.timestamp), { addSuffix: true });
    } catch (e) {
      console.error("Invalid date format:", lastVisit.timestamp);
      return "recently";
    }
  };
  
  // Determine card accent color based on rating
  const getRatingColor = () => {
    if (!lastVisit) return "bg-gray-200";
    
    const rating = lastVisit.rating.overall;
    if (rating >= 4) return "bg-green-500";
    if (rating >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div 
      className={cn(
        "bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative",
        className
      )}
      onClick={onClick}
    >
      {/* Left accent bar showing rating color */}
      {lastVisit && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getRatingColor()}`}></div>
      )}
      
      {/* Main card content */}
      <div className="flex p-4">
        {/* Venue image */}
        <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 mr-4">
          {venue.photos && venue.photos.length > 0 ? (
            <img 
              src={venue.photos[0]} 
              alt={venue.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
              <MapPin className="w-8 h-8" />
            </div>
          )}
        </div>
        
        {/* Venue details */}
        <div className="flex-1">
          <h3 className="text-lg font-bold line-clamp-1">{venue.name}</h3>
          
          <p className="text-gray-500 text-sm mb-1 line-clamp-1">{venue.address}</p>
          
          {/* Price level and category */}
          <div className="flex flex-wrap gap-1 mb-1">
            {venue.priceLevel && (
              <Badge variant="secondary" className="text-xs">
                {"$".repeat(venue.priceLevel)}
              </Badge>
            )}
            
            {venue.category && venue.category.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {venue.category[0].split('_').join(' ')}
              </Badge>
            )}
            
            {venue.googleRating && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 
                {venue.googleRating.toFixed(1)}
              </Badge>
            )}
          </div>
          
          {/* Last visit info */}
          {lastVisit && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <CalendarIcon className="w-3 h-3 mr-1" />
              <span>Visited {getLastVisitText()}</span>
              
              {lastVisit.rating && (
                <div className="ml-2 flex items-center">
                  <StarRating
                    rating={lastVisit.rating.overall}
                    size="xs"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
