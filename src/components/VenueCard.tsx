
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Venue } from "@/types";
import { CalendarCheck, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface VenueCardProps {
  venue: Venue;
  lastVisit?: any;
  onClick?: () => void;
  onCheckInClick?: () => void;
  isSelected?: boolean;
}

const VenueCard = ({ venue, lastVisit, onClick, onCheckInClick, isSelected }: VenueCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  const getCategoryBadgeColor = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('restaurant')) return 'bg-red-100 text-red-800';
    if (lowerCategory.includes('cafe')) return 'bg-green-100 text-green-800';
    if (lowerCategory.includes('bar')) return 'bg-purple-100 text-purple-800';
    if (lowerCategory.includes('bakery')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const hasValidImage = venue.photos && venue.photos.length > 0 && !imageError;

  return (
    <Card 
      className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${isSelected ? 'border-visitvibe-primary' : ''}`} 
      onClick={onClick}
    >
      <div className="relative flex flex-col h-full">
        {/* Image container with fixed height */}
        <div className="h-48 relative bg-gray-100">
          {hasValidImage ? (
            <img 
              src={venue.photos[0]} 
              alt={venue.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <div className="text-center px-4">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">{venue.name}</p>
              </div>
            </div>
          )}
          
          {/* Last visited overlay */}
          {lastVisit && (
            <div className="absolute top-0 right-0 bg-black/70 text-white text-xs py-1 px-2 m-2 rounded-md flex items-center">
              <CalendarCheck className="w-3 h-3 mr-1" />
              {formatDistanceToNow(new Date(lastVisit.timestamp), { addSuffix: true })}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4 flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-1">{venue.name}</h3>
            
            {/* Rating badge */}
            {lastVisit?.rating?.overall ? (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                lastVisit.rating.overall >= 4 ? 'bg-green-100 text-green-800' :
                lastVisit.rating.overall >= 3 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {lastVisit.rating.overall}
              </span>
            ) : null}
          </div>
          
          <p className="text-sm text-gray-500 mb-2 line-clamp-1 flex items-center">
            <MapPin className="h-3 w-3 mr-1 inline flex-shrink-0" />
            {venue.address}
          </p>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-1 mb-4">
            {venue.category && venue.category.slice(0, 3).map((cat, index) => (
              <span 
                key={index} 
                className={`${getCategoryBadgeColor(cat)} text-xs px-2 py-0.5 rounded-full`}
              >
                {cat}
              </span>
            ))}
          </div>
          
          {/* Visited status */}
          {lastVisit && (
            <div className="text-xs text-gray-500 mb-2">
              <p>Last visit: {new Date(lastVisit.timestamp).toLocaleDateString()}</p>
              {lastVisit.dishes && lastVisit.dishes.length > 0 && (
                <p className="line-clamp-1">
                  Tried: {lastVisit.dishes.map((dish: any) => dish.name).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Action button */}
        {onCheckInClick && (
          <div className="px-4 pb-4 mt-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onCheckInClick();
              }}
            >
              {lastVisit ? 'Check In Again' : 'Check In Here'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VenueCard;
