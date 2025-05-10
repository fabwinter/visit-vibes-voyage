
import { Venue } from '@/types';

interface MarkerPopupProps {
  venue: Venue;
}

const MarkerPopup = ({ venue }: MarkerPopupProps) => {
  return (
    <div className="p-3 max-w-xs">
      {venue.photos && venue.photos.length > 0 ? (
        <img 
          src={venue.photos[0]} 
          alt={venue.name} 
          className="w-full h-32 object-cover mb-2 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
          }}
        />
      ) : null}
      <h3 className="font-semibold text-base">{venue.name}</h3>
      <p className="text-sm text-gray-600">{venue.address}</p>
      {venue.category ? (
        <p className="text-xs text-gray-500 mt-1">
          {venue.category.join(', ').replace(/_/g, ' ')}
        </p>
      ) : null}
    </div>
  );
};

export default MarkerPopup;
