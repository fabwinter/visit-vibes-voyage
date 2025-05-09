
import { useEffect, useState } from 'react';
import { Venue } from '@/types';
import MapPlaceholder from '../MapPlaceholder';
import { toast } from 'sonner';

interface MapBoxProps {
  venues: Venue[];
  onVenueSelect: (venueId: string) => void;
  userLocation?: { lat: number; lng: number };
  mapboxToken?: string;
  selectedVenue?: string | null;
  className?: string;
  onMapMove?: (center: { lat: number; lng: number }) => void;
}

const MapBox = ({ 
  venues, 
  onVenueSelect, 
  userLocation, 
  selectedVenue, 
  className
}: MapBoxProps) => {
  const [selectedVenueObj, setSelectedVenueObj] = useState<Venue | null>(null);

  // Update selected venue when the selectedVenue ID changes
  useEffect(() => {
    if (!selectedVenue) {
      setSelectedVenueObj(null);
      return;
    }
    
    const venue = venues.find(v => v.id === selectedVenue);
    if (venue) {
      setSelectedVenueObj(venue);
    }
  }, [selectedVenue, venues]);

  const handleVenueClick = (venueId: string) => {
    onVenueSelect(venueId);
    toast.info("Venue selected");
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapPlaceholder className="rounded-lg" />
      
      {/* Simple venue list overlay */}
      {venues.length > 0 && (
        <div className="absolute bottom-2 left-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md max-h-32 overflow-y-auto shadow-md">
          <h3 className="text-xs font-medium mb-1">Nearby Places ({venues.length})</h3>
          <div className="space-y-1">
            {venues.slice(0, 5).map((venue) => (
              <button
                key={venue.id}
                className={`text-xs text-left block w-full px-2 py-1 rounded ${
                  selectedVenue === venue.id ? 'bg-visitvibe-primary text-white' : 'hover:bg-gray-100'
                }`}
                onClick={() => handleVenueClick(venue.id)}
              >
                {venue.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Selected venue info */}
      {selectedVenueObj && (
        <div className="absolute top-2 left-2 right-2 bg-white p-2 rounded-md shadow-md">
          <h3 className="font-medium">{selectedVenueObj.name}</h3>
          <p className="text-xs text-gray-600">{selectedVenueObj.address}</p>
          {selectedVenueObj.category && selectedVenueObj.category.length > 0 && (
            <p className="text-xs text-gray-500">{selectedVenueObj.category[0]}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MapBox;
