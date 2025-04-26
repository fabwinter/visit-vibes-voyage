
import { useState } from 'react';
import { Search } from 'lucide-react';
import MapPlaceholder from '../components/MapPlaceholder';
import CheckInButton from '../components/CheckInButton';
import VenueCard from '../components/VenueCard';
import { mockVenues, mockVisits } from '../data/mockData';

const MapView = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const getLastVisitForVenue = (venueId: string) => {
    return mockVisits.find(visit => visit.venueId === venueId);
  };

  // This would be replaced with actual check-in logic
  const handleCheckIn = () => {
    alert('Check-in feature coming soon!');
  };

  return (
    <div className="h-screen pt-4 pb-20">
      {/* Search bar */}
      <div className="relative mx-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-visitvibe-primary/50"
          />
        </div>
      </div>

      {/* Map area */}
      <div className="h-[40vh] w-full">
        <MapPlaceholder />
      </div>

      {/* Recent venues */}
      <div className="px-4 mt-4">
        <h2 className="text-xl font-bold mb-3">Recent Visits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockVenues.slice(0, 4).map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              lastVisit={getLastVisitForVenue(venue.id)}
            />
          ))}
        </div>
      </div>

      {/* Floating check-in button */}
      <CheckInButton 
        className="fixed right-6 bottom-24 w-14 h-14"
        onClick={handleCheckIn}
      />
    </div>
  );
};

export default MapView;
