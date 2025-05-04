
// Assuming this file is read-only, I need to create a new modified version
// This will be a wrapper component that extends the functionality of VenueCard

import React from 'react';
import { Venue, Visit } from '@/types';
import { Share2, Heart, CheckSquare } from 'lucide-react';
import { Button } from './ui/button';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import OriginalVenueCard from './VenueCard';

interface EnhancedVenueCardProps {
  venue: Venue;
  lastVisit?: Visit;
  onClick?: () => void;
  onCheckIn: (venue: Venue) => void;
  className?: string;
}

const EnhancedVenueCard: React.FC<EnhancedVenueCardProps> = ({
  venue,
  lastVisit,
  onClick,
  onCheckIn,
  className
}) => {
  const { isAuthenticated, setShowAuthModal } = useAuthContext();
  const { addToWishlist, removeFromWishlist } = useWishlist();
  
  const handleCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheckIn(venue);
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator.share({
        title: `Check out ${venue.name} on VisitVibe`,
        text: `I found ${venue.name} on VisitVibe and thought you might like it!`,
        url: window.location.href,
      }).catch((error) => {
        console.log('Error sharing:', error);
        toast.error('Unable to share. Please try again.');
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Link copied to clipboard!'))
        .catch(() => toast.error('Failed to copy link.'));
    }
  };
  
  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    if (venue.inWishlist) {
      removeFromWishlist(venue.id);
      toast.success(`${venue.name} removed from wishlist`);
    } else {
      addToWishlist(venue.id);
      toast.success(`${venue.name} added to wishlist`);
    }
  };
  
  return (
    <div className={cn("relative", className)}>
      <OriginalVenueCard
        venue={venue}
        lastVisit={lastVisit}
        onClick={onClick}
      />
      
      {/* Action buttons */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCheckIn} 
          className="text-white hover:bg-white/20"
        >
          <CheckSquare className="h-4 w-4 mr-1" />
          Check-in
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShare} 
          className="text-white hover:bg-white/20"
        >
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleWishlist} 
          className={cn(
            "text-white hover:bg-white/20",
            venue.inWishlist && "text-red-400"
          )}
        >
          <Heart className={cn(
            "h-4 w-4 mr-1",
            venue.inWishlist && "fill-red-400"
          )} />
          {venue.inWishlist ? "Saved" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedVenueCard;
