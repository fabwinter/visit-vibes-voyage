
import { useState } from 'react';
import { mockVisits, mockVenues } from '../data/mockData';
import VisitCard from '../components/VisitCard';
import { format } from 'date-fns';

const VisitsView = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getVenueName = (venueId: string) => {
    const venue = mockVenues.find(v => v.id === venueId);
    return venue ? venue.name : 'Unknown Venue';
  };

  // Group visits by month
  const groupedVisits = mockVisits.reduce((acc, visit) => {
    const date = new Date(visit.timestamp);
    const monthYear = format(date, 'MMMM yyyy');
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    
    acc[monthYear].push(visit);
    return acc;
  }, {} as Record<string, typeof mockVisits>);

  // Order the months chronologically (most recent first)
  const orderedMonths = Object.keys(groupedVisits).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Visit History</h1>

      {/* Filter tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['all', 'recent', 'highest rated', 'lowest rated'].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedFilter === filter
                ? 'bg-visitvibe-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Visit timeline */}
      <div className="space-y-8">
        {orderedMonths.map((month) => (
          <div key={month}>
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">{month}</h2>
            <div className="space-y-4">
              {groupedVisits[month].map((visit) => (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                  venueName={getVenueName(visit.venueId)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitsView;
