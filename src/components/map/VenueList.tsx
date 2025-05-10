
import { Button } from '@/components/ui/button';
import VenueCard from '../VenueCard';
import { Venue } from '@/types';
import { MapPin, AlertCircle } from 'lucide-react';

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
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Food Venues Nearby</h2>
        <span className="text-xs text-gray-500">
          {isLoading ? 'Loading...' : `${venues.length} results within 2km`}
        </span>
      </div>
      
      {usingMockData && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-medium">Using mock data</p>
            <p className="text-yellow-600">API connection issue or no results returned.</p>
          </div>
        </div>
      )}
      
      {isLoading && venues.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-visitvibe-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-2"></div>
          <p className="text-sm text-gray-600">Finding food venues near you...</p>
          <p className="text-xs text-gray-500 mt-1">Showing venues within 2km of your location</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
          <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 font-medium">No food venues found nearby</p>
          <p className="text-xs text-gray-500 mt-1">Try changing your location or search terms</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {venues.map((venue) => (
              <div 
                key={venue.id} 
                id={`venue-${venue.id}`}
                className={`transition-all duration-200 ${selectedVenue === venue.id ? 'ring-2 ring-visitvibe-primary ring-offset-2' : ''}`}
              >
                <VenueCard
                  venue={venue}
                  lastVisit={venue.lastVisit}
                  onClick={() => onVenueSelect(venue.id)}
                  onCheckInClick={onCheckInClick}
                />
              </div>
            ))}
          </div>
          
          {nextPageToken && !usingMockData && (
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={onLoadMore}
                disabled={isLoading}
                className="w-full"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-visitvibe-primary border-r-transparent align-[-0.125em] mr-2"></span>
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
