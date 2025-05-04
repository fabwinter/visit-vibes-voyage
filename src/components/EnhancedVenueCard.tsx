
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Check, Star, Clock, Info } from 'lucide-react';
import { Venue, Visit } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export interface EnhancedVenueCardProps {
  venue: Venue;
  lastVisit?: Visit;
  onClick: () => void;
  onCheckIn: () => void;
}

const EnhancedVenueCard: React.FC<EnhancedVenueCardProps> = ({
  venue,
  lastVisit,
  onClick,
  onCheckIn
}) => {
  const renderGoogleRating = () => {
    if (!venue.googleRating) return null;
    
    return (
      <div className="flex items-center text-xs">
        <Star className="h-3 w-3 text-amber-500 mr-0.5 fill-amber-500" />
        <span>{venue.googleRating.toFixed(1)}</span>
      </div>
    );
  };

  const renderLastVisit = () => {
    if (!lastVisit) return null;
    
    const visitTimeAgo = formatDistanceToNow(new Date(lastVisit.timestamp), { addSuffix: true });
    
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
        <Check className="h-3 w-3" />
        <span>Visited {visitTimeAgo}</span>
        {lastVisit.rating?.overall && (
          <div className="flex items-center ml-1">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span>{lastVisit.rating.overall.toFixed(1)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="relative">
        {venue.photos && venue.photos.length > 0 ? (
          <div className="h-32 overflow-hidden">
            <img 
              src={venue.photos[0]} 
              alt={venue.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
              }}
            />
          </div>
        ) : (
          <div className="h-32 bg-gray-100 flex items-center justify-center">
            <Info className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>
      
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-base line-clamp-1">{venue.name}</h3>
          {renderGoogleRating()}
        </div>
        
        <div className="flex items-start gap-1 mt-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{venue.address}</span>
        </div>
        
        {renderLastVisit()}
        
        {venue.category && venue.category.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {venue.category.slice(0, 2).map((cat, i) => (
              <Badge key={i} variant="outline" className="text-[0.65rem] py-0 px-1.5">
                {cat.replace(/_/g, ' ')}
              </Badge>
            ))}
            {venue.category.length > 2 && (
              <Badge variant="outline" className="text-[0.65rem] py-0 px-1.5">
                +{venue.category.length - 2}
              </Badge>
            )}
          </div>
        )}
        
        <div className="mt-3 flex justify-end">
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onCheckIn();
            }}
            className="text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Check In
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedVenueCard;
