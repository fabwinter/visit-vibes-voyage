
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, Camera, Share2, ArrowRight, Check, X, Globe, ArrowUpRight } from 'lucide-react';
import StarRating from './StarRating';
import { Visit, Venue } from '../types';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface VisitCardProps {
  visit: Visit;
  venueName: string;
  venueDetails?: Venue | null;
  className?: string;
}

const VisitCard = ({ visit, venueName, venueDetails, className = '' }: VisitCardProps) => {
  const visitDate = new Date(visit.timestamp);

  // Handle sharing venue
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent click from bubbling
    
    if (navigator.share) {
      navigator.share({
        title: `My visit to ${venueName}`,
        text: `I visited ${venueName} on ${format(visitDate, 'MMM d, yyyy')} and rated it ${visit.rating.overall}/5`,
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
    <Link 
      to={`/visit/${visit.id}`}
      className={`block rounded-lg overflow-hidden shadow-md bg-white ${className}`}
    >
      <div className="relative h-48">
        {/* Show venue photo if available, otherwise visit photo */}
        {(venueDetails?.photos?.length > 0 || visit.photos.length > 0) ? (
          <img
            src={(venueDetails?.photos && venueDetails.photos.length > 0) ? 
                  venueDetails.photos[0] : 
                  visit.photos[0]}
            alt={`Visit to ${venueName}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
            }}
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
        
        {/* Share button */}
        <button
          onClick={handleShare}
          className="absolute top-3 right-3 bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition-all"
          aria-label="Share this visit"
        >
          <Share2 size={16} />
        </button>
      </div>
      
      <div className="p-4">
        {/* Venue website if available - enhanced with button */}
        {venueDetails?.website && (
          <div className="mb-3">
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-1 w-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(venueDetails.website, '_blank');
              }}
            >
              <Globe size={14} />
              <span className="flex-1 text-left">Visit Website</span>
              <ArrowUpRight size={14} />
            </Button>
          </div>
        )}
      
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
        
        {/* Would visit again indicator */}
        <div className="flex items-center gap-1 mb-2 text-sm">
          {visit.wouldVisitAgain !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              visit.wouldVisitAgain 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {visit.wouldVisitAgain 
                ? <Check className="w-3 h-3" /> 
                : <X className="w-3 h-3" />
              }
              {visit.wouldVisitAgain 
                ? 'Would visit again' 
                : 'Would not visit again'
              }
            </div>
          )}
        </div>
        
        {/* Venue categories if available */}
        {venueDetails?.category && venueDetails.category.length > 0 && (
          <div className="flex flex-wrap gap-1 my-2">
            {venueDetails.category.slice(0, 2).map((tag) => (
              <span key={tag} className="tag-badge text-xs">
                {tag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
        
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
        
        <div className="flex justify-end mt-3">
          <ArrowRight className="w-4 h-4 text-visitvibe-primary" />
        </div>
      </div>
    </Link>
  );
};

export default VisitCard;
