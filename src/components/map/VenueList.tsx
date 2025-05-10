
import { Button } from '@/components/ui/button';
import VenueCard from '../VenueCard';
import { Venue } from '@/types';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface VenueListProps {
  venues: Venue[];
  isLoading: boolean;
  usingMockData: boolean;
  selectedVenue: string | null;
  nextPageToken?: string;
  onVenueSelect: (venueId: string) => void;
  onLoadMore: () => void;
  onCheckInClick?: (venue: Venue) => void;
}

const VenueList = ({
  venues,
  isLoading,
  usingMockData,
  selectedVenue,
  nextPageToken,
  onVenueSelect,
  onLoadMore,
  onCheckInClick
}: VenueListProps) => {
  // Ref for auto-scrolling to selected venue
  const selectedVenueRef = useRef<HTMLDivElement>(null);
  
  // Effect to scroll to selected venue when it changes
  useEffect(() => {
    if (selectedVenue && selectedVenueRef.current) {
      setTimeout(() => {
        selectedVenueRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [selectedVenue]);

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Food Venues Nearby</h2>
        <span className="text-xs text-gray-500">
          {isLoading ? 'Loading...' : `${venues.length} results within 2km`}
        </span>
      </div>
      
      {usingMockData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-medium">Using sample data</p>
            <p className="text-yellow-600">API connection issue or no results returned.</p>
          </div>
        </div>
      )}
      
      {isLoading && venues.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-visitvibe-primary mb-3" />
          <p className="text-sm text-gray-600">Finding food venues near you...</p>
          <p className="text-xs text-gray-500 mt-1">Showing venues within 2km of your location</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 font-medium">No food venues found nearby</p>
          <p className="text-xs text-gray-500 mt-1">Try changing your location or search terms</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {venues.map((venue) => (
              <div 
                key={venue.id} 
                id={`venue-${venue.id}`}
                ref={selectedVenue === venue.id ? selectedVenueRef : null}
                className={`transition-all duration-300 ${
                  selectedVenue === venue.id 
                    ? 'ring-2 ring-visitvibe-primary ring-offset-2 scale-[1.02] shadow-md' 
                    : 'hover:scale-[1.01] hover:shadow-sm'
                }`}
              >
                <VenueCard
                  venue={venue}
                  lastVisit={venue.lastVisit}
                  onClick={() => onVenueSelect(venue.id)}
                  onCheckInClick={onCheckInClick ? () => onCheckInClick(venue) : undefined}
                  isSelected={selectedVenue === venue.id}
                />
              </div>
            ))}
          </div>
          
          {nextPageToken && !usingMockData && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={onLoadMore}
                disabled={isLoading}
                className="w-full md:w-auto"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Loading...
                  </>
                ) : 'Load More Venues'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VenueList;
