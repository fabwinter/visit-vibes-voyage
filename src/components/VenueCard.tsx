
import { Link } from 'react-router-dom';
import { MapPin, Utensils, Coffee, Share2 } from 'lucide-react';
import StarRating from './StarRating';
import { Venue, Visit } from '../types';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';

interface VenueCardProps {
  venue: Venue;
  lastVisit?: Visit;
  className?: string;
  onClick?: () => void;
}

const VenueCard = ({ venue, lastVisit, className = '', onClick }: VenueCardProps) => {
  const isMobile = useIsMobile();
  
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

  return (
    <div 
      onClick={onClick} 
      className={`cursor-pointer ${isMobile ? 'active:bg-gray-50' : ''}`}
    >
      <div
        className={`block rounded-lg overflow-hidden shadow-md bg-white transition-transform ${isMobile ? 'hover:bg-gray-50 active:scale-[0.99]' : 'hover:scale-[1.02]'} ${className}`}
      >
        <div className="relative h-40">
          <img
            src={venue.photos?.[0] || 'https://placehold.co/600x400?text=No+Image'}
            alt={venue.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
            }}
          />
          
          {venue.priceLevel !== undefined && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              {'$'.repeat(venue.priceLevel)}
            </div>
          )}
          
          {lastVisit && (
            <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Last visited: {new Date(lastVisit.timestamp).toLocaleDateString()}
            </div>
          )}
          
          {/* Share button */}
          <button
            onClick={handleShare}
            className={`absolute top-3 left-3 bg-black/50 rounded-full p-2 text-white ${isMobile ? 'hover:bg-black/60 active:bg-black/70' : 'hover:bg-black/70'} transition-all`}
            aria-label="Share this venue"
          >
            <Share2 size={16} />
          </button>
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
              {lastVisit.wouldVisitAgain !== undefined && (
                <div className={`text-xs mt-1 ${lastVisit.wouldVisitAgain ? 'text-green-600' : 'text-red-600'}`}>
                  {lastVisit.wouldVisitAgain ? 'Would visit again' : 'Would not visit again'}
                </div>
              )}
            </div>
          )}
          
          {venue.category && venue.category.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {venue.category.slice(0, 3).map((cat) => (
                <span key={cat} className="tag-badge">
                  {formatCategory(cat)}
                </span>
              ))}
              {venue.category.length > 3 && (
                <span className="text-xs text-gray-500">+{venue.category.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
