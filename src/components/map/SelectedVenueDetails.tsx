
import { Button } from "@/components/ui/button";
import { Venue } from "@/types";
import { formatDistance } from 'date-fns';
import { Phone, Globe, MapPin, Clock } from 'lucide-react';
import CheckInButton from "@/components/CheckInButton";
import WishlistButton from "@/components/WishlistButton";

interface SelectedVenueDetailsProps {
  venue: Venue | null;
  onClose: () => void;
  onCheckIn: (venue: Venue) => void;
}

const SelectedVenueDetails: React.FC<SelectedVenueDetailsProps> = ({
  venue,
  onClose,
  onCheckIn,
}) => {
  if (!venue) {
    return null;
  }

  const formattedDate =
    venue.lastVisit?.timestamp &&
    formatDistance(new Date(venue.lastVisit.timestamp), new Date(), {
      addSuffix: true,
    });

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-lg rounded-t-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold">{venue.name}</h3>
          <p className="text-gray-500 text-sm">{venue.address}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500"
        >
          ×
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {venue.photos && venue.photos.length > 0 && (
          <div className="aspect-w-16 aspect-h-9 w-full">
            <img
              src={venue.photos[0]}
              alt={venue.name}
              className="object-cover w-full h-36 rounded"
            />
          </div>
        )}

        <div className="space-y-2">
          {venue.phoneNumber && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <a href={`tel:${venue.phoneNumber}`} className="text-blue-500">
                {venue.phoneNumber}
              </a>
            </div>
          )}

          {venue.website && (
            <div className="flex items-center space-x-2 text-sm">
              <Globe className="h-4 w-4 text-gray-500" />
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                Website
              </a>
            </div>
          )}

          {venue.address && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{venue.address}</span>
            </div>
          )}

          {venue.hours && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{venue.hours}</span>
            </div>
          )}

          {venue.lastVisit && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
              <p className="font-medium">Last visited {formattedDate}</p>
              <p>
                Rated:{" "}
                <span className="font-semibold">
                  {venue.lastVisit.rating.overall}/5
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <Button 
          variant="default" 
          onClick={() => onCheckIn(venue)}
          className="flex items-center gap-2"
        >
          <span>Check In</span>
        </Button>
        <WishlistButton venue={venue} />
      </div>
    </div>
  );
};

export default SelectedVenueDetails;
