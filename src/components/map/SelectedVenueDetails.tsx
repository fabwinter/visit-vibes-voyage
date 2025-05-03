
import { Button } from '@/components/ui/button';
import { Share2, MapPin } from 'lucide-react';
import { Venue } from '@/types';
import { toast } from 'sonner';

interface SelectedVenueDetailsProps {
  venue: Venue;
  onCheckIn: () => void;
}

const SelectedVenueDetails = ({ venue, onCheckIn }: SelectedVenueDetailsProps) => {
  const handleShare = () => {
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
    <div className="my-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-2">{venue.name}</h2>
      
      {venue.photos && venue.photos.length > 0 && (
        <div className="mb-3 rounded-md overflow-hidden">
          <img 
            src={venue.photos[0]} 
            alt={venue.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
            }}
          />
        </div>
      )}
      
      <p className="text-gray-600 mb-2 flex items-start gap-1">
        <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
        <span>{venue.address}</span>
      </p>
      
      {venue.phoneNumber && (
        <p className="text-gray-600 mb-2">📞 {venue.phoneNumber}</p>
      )}
      
      {venue.website && (
        <p className="text-gray-600 mb-2">
          <a href={venue.website} target="_blank" rel="noopener noreferrer" 
             className="text-visitvibe-primary hover:underline">
            Website
          </a>
        </p>
      )}
      
      {venue.hours && (
        <p className="text-gray-600 mb-2 text-sm">{venue.hours}</p>
      )}
      
      {venue.category && venue.category.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {venue.category.map((cat) => (
            <span key={cat} className="tag-badge">
              {cat.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
      
      <div className="mt-4 flex flex-col space-y-2">
        <Button 
          onClick={onCheckIn} 
          className="w-full bg-visitvibe-primary hover:bg-visitvibe-primary/90"
        >
          Check In
        </Button>
        
        <Button 
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          Share Venue
        </Button>
      </div>
    </div>
  );
};

export default SelectedVenueDetails;
