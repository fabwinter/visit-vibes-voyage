
import { Link } from 'react-router-dom';
import { Check, MapPin, Utensils, Coffee, Share2, Heart, ImageOff } from 'lucide-react';
import StarRating from './StarRating';
import { Venue, Visit } from '../types';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { useState } from 'react';

interface VenueCardProps {
  venue: Venue;
  lastVisit?: Visit;
  className?: string;
  onClick?: () => void;
  onCheckInClick?: (venue: Venue) => void;
}

const VenueCard = ({ venue, lastVisit, className = '', onClick, onCheckInClick }: VenueCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const venueInWishlist = isInWishlist(venue.id);
  const [imageError, setImageError] = useState(false);
  
  // Function to determine venue icon based on categories
  const getVenueIcon = () => {
    const categories = venue.category?.map(c => c.toLowerCase()) || [];
    
    if (categories.some(c => c.includes('cafe') || c.includes('coffee'))) {
      return <Coffee className="w-4 h-4 mr-1" />;
    }
    
    return <Utensils className="w-4 h-4 mr-1" />;
  };
  
  // Format category names for display
  const formatCategory = (category: string) => {
    return category
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Handle share action
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent triggering the card click
    
    if (navigator.share) {
      navigator.share({
        title: venue.name,
        text: `Check out ${venue.name} at ${venue.address}`,
        url: window.location.href
      })
      .then(() => toast.success("Shared successfully"))
      .catch(error => console.error('Error sharing', error));
    } else {
      toast("Sharing not supported on this browser", {
        description: "Try copying the link directly"
      });
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent triggering the card click
    
    if (venueInWishlist) {
      removeFromWishlist(venue.id);
      toast.success(`Removed ${venue.name} from wishlist`);
    } else {
      addToWishlist(venue, [], undefined);
      toast.success(`Added ${venue.name} to wishlist`);
    }
  };

  // Handle check-in
  const handleCheckIn = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent triggering the card click
    
    if (onCheckInClick) {
      onCheckInClick(venue);
    }
  };

  // Get main photo URL or fallback
  const getPhotoUrl = () => {
    if (imageError || !venue.photos || venue.photos.length === 0) {
      return 'https://placehold.co/600x400?text=No+Image';
    }
    return venue.photos[0];
  };

  return (
    <div onClick={onClick} className={`cursor-pointer transition-transform ${className}`}>
      <div className="block rounded-lg overflow-hidden shadow-sm bg-white border border-gray-100">
        {/* Card header with image */}
        <div className="relative h-36 sm:h-40">
          {imageError || !venue.photos || venue.photos.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ImageOff className="h-8 w-8 text-gray-400" />
            </div>
          ) : (
            <img
              src={getPhotoUrl()}
              alt={venue.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}
          
          {venue.priceLevel !== undefined && (
            <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {'$'.repeat(venue.priceLevel)}
            </div>
          )}
          
          {lastVisit && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Last visited: {new Date(lastVisit.timestamp).toLocaleDateString()}
            </div>
          )}
        </div>
        
        {/* Card content */}
        <div className="p-3">
          <h3 className="text-base font-semibold line-clamp-1">{venue.name}</h3>
          
          <div className="flex items-center text-gray-600 text-xs mt-1">
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{venue.address}</span>
          </div>
          
          {lastVisit && (
            <div className="mt-2">
              <StarRating rating={lastVisit.rating.overall} size="sm" />
              {lastVisit.wouldVisitAgain !== undefined && (
                <div className={`text-xs mt-1 ${lastVisit.wouldVisitAgain ? 'text-green-600' : 'text-red-600'}`}>
                  {lastVisit.wouldVisitAgain ? 'Would visit again' : 'Would not visit again'}
                </div>
              )}
            </div>
          )}
          
          {venue.category && venue.category.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {venue.category.slice(0, 2).map((cat) => (
                <span key={cat} className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-600">
                  {formatCategory(cat)}
                </span>
              ))}
              {venue.category.length > 2 && (
                <span className="text-xs text-gray-500">+{venue.category.length - 2} more</span>
              )}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
            {/* Check-in button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 h-8 text-xs"
              onClick={handleCheckIn}
            >
              <Check className="h-4 w-4 mr-1" />
              Check-in
            </Button>
            
            {/* Wishlist button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-4 w-4 mr-1 ${venueInWishlist ? 'fill-visitvibe-primary' : ''}`} />
              {venueInWishlist ? 'Saved' : 'Save'}
            </Button>
            
            {/* Share button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
