
import { Button } from '@/components/ui/button';
import VenueCard from '../VenueCard';
import { Venue } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface VenueListProps {
  venues: Venue[];
  isLoading: boolean;
  usingMockData: boolean;
  selectedVenue: string | null;
  nextPageToken?: string;
  onVenueSelect: (venueId: string) => void;
  onLoadMore: () => void;
}

const VenueList = ({
  venues,
  isLoading,
  usingMockData,
  selectedVenue,
  nextPageToken,
  onVenueSelect,
  onLoadMore
}: VenueListProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">Food Venues</h2>
        <span className="text-sm text-gray-500">
          {isLoading ? 'Loading...' : `${venues.length} results`}
        </span>
      </div>
      
      {usingMockData && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
          Using mock data. API connection issue or no results returned.
        </div>
      )}
      
      {isLoading && venues.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-visitvibe-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-500">Loading food venues...</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No food venues found in this area</p>
        </div>
      ) : (
        <>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 gap-4'}`}>
            {venues.map((venue) => (
              <div 
                key={venue.id} 
                id={`venue-${venue.id}`}
                className={`transition-all duration-200 ${selectedVenue === venue.id ? 'ring-2 ring-visitvibe-primary ring-offset-2' : ''}`}
                onClick={() => onVenueSelect(venue.id)}
              >
                <VenueCard
                  venue={venue}
                  lastVisit={venue.lastVisit}
                  onClick={() => onVenueSelect(venue.id)}
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
              >
                {isLoading ? 'Loading...' : 'Load More Venues'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VenueList;
