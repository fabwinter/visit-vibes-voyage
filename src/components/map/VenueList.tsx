
import React from 'react';
import { Venue } from '@/types';
import VenueCard from '../VenueCard';
import EnhancedVenueCard from '../EnhancedVenueCard';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface VenueListProps {
  venues: Venue[];
  selectedVenue: string | null;
  isLoading: boolean;
  usingMockData?: boolean;
  nextPageToken: string | null;
  onVenueSelect: (venueId: string) => void;
  onLoadMore: () => void;
  onCheckIn: (venue: Venue) => void;
  useEnhancedCard?: boolean;
}

const VenueList: React.FC<VenueListProps> = ({
  venues,
  selectedVenue,
  isLoading,
  usingMockData,
  nextPageToken,
  onVenueSelect,
  onLoadMore,
  onCheckIn,
  useEnhancedCard = false
}) => {
  if (isLoading && venues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
        <p className="text-gray-500">Loading venues...</p>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-2">No venues found in this area</p>
        <p className="text-sm text-gray-400">Try a different location or zoom out</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 mb-4">
        {venues.map((venue) => (
          <div
            key={venue.id}
            id={`venue-${venue.id}`}
            className={`transition-all duration-200 ${
              selectedVenue === venue.id
                ? "ring-2 ring-visitvibe-primary ring-offset-2"
                : ""
            }`}
          >
            {useEnhancedCard ? (
              <EnhancedVenueCard
                venue={venue}
                lastVisit={venue.lastVisit}
                onClick={() => onVenueSelect(venue.id)}
                onCheckIn={onCheckIn}
              />
            ) : (
              <VenueCard
                venue={venue}
                lastVisit={venue.lastVisit}
                onClick={() => onVenueSelect(venue.id)}
              />
            )}
          </div>
        ))}
      </div>

      {nextPageToken && (
        <div className="flex justify-center mt-4">
          <Button onClick={onLoadMore} variant="outline" className="w-full">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Load More Results
          </Button>
        </div>
      )}

      {usingMockData && (
        <div className="text-center text-xs text-gray-400 mt-4">
          Using mock data (API error or no API key configured)
        </div>
      )}
    </div>
  );
};

export default VenueList;
