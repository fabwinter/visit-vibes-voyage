
import { Button } from '@/components/ui/button';
import VenueCard from '../VenueCard';
import { Venue } from '@/types';
import { MapPin, AlertCircle, WifiOff, RefreshCw } from 'lucide-react';

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
        <h2 className="text-lg font-bold">Food Venues</h2>
        <div className="flex items-center">
          {usingMockData && (
            <span className="text-xs text-amber-600 mr-2 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              Using local data
            </span>
          )}
          <span className="text-xs text-gray-500">
            {isLoading ? 'Loading...' : `${venues.length} results within 5km`}
          </span>
        </div>
      </div>
      
      {isLoading && venues.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-visitvibe-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-2"></div>
          <p className="text-sm text-gray-600">Loading food venues...</p>
          <p className="text-xs text-gray-500 mt-1">Finding the best nearby options for you</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
          {!navigator.onLine ? (
            <>
              <WifiOff className="h-8 w-8 mx-auto text-amber-500 mb-2" />
              <p className="text-sm text-gray-600 font-medium">You're offline</p>
              <p className="text-xs text-gray-500 mt-1">Connect to the internet to search for venues</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-1" /> Try Again
              </Button>
            </>
          ) : (
            <>
              <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">No food venues found</p>
              <p className="text-xs text-gray-500 mt-1">Try changing your location or search terms</p>
            </>
          )}
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
          
          {nextPageToken && (
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
      
      {usingMockData && venues.length > 0 && (
        <div className="mt-3 p-2 bg-amber-50 rounded-md text-sm text-amber-800 flex items-center">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <p>
            Showing suggested venues. Some features may be limited.
          </p>
        </div>
      )}
    </div>
  );
};

export default VenueList;
