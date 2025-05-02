
import { useState } from 'react';
import { mockVisits, mockVenues } from '../data/mockData';
import VisitCard from '../components/VisitCard';
import VisitCalendar from '../components/VisitCalendar';
import { format, isAfter, isBefore } from 'date-fns';

const VisitsView = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});

  const getVenueName = (venueId: string) => {
    const venue = mockVenues.find(v => v.id === venueId);
    return venue ? venue.name : 'Unknown Venue';
  };

  // Apply both filter and date filter
  const filteredVisits = mockVisits.filter(visit => {
    const visitDate = new Date(visit.timestamp);
    let passesDateFilter = true;

    if (dateFilter.from) {
      // If we only have a "from" date, show visits on or after that date
      passesDateFilter = isAfter(visitDate, new Date(dateFilter.from.setHours(0, 0, 0, 0))) || 
                         visit.timestamp.startsWith(format(dateFilter.from, 'yyyy-MM-dd'));
    }

    if (dateFilter.to) {
      // Also filter by "to" date if it exists
      passesDateFilter = passesDateFilter && 
                        (isBefore(visitDate, new Date(dateFilter.to.setHours(23, 59, 59, 999))) || 
                         visit.timestamp.startsWith(format(dateFilter.to, 'yyyy-MM-dd')));
    }

    // Apply the selected filter
    switch (selectedFilter) {
      case 'recent':
        return passesDateFilter && new Date(visit.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      case 'highest rated':
        return passesDateFilter && visit.rating.overall >= 4;
      case 'lowest rated':
        return passesDateFilter && visit.rating.overall <= 2;
      default:
        return passesDateFilter;
    }
  });

  // Group visits by month
  const groupedVisits = filteredVisits.reduce((acc, visit) => {
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

      {/* Visit calendar */}
      <div className="mb-6">
        <VisitCalendar visits={mockVisits} onDateFilterChange={setDateFilter} />
      </div>

      {/* Visit timeline */}
      <div className="space-y-8">
        {orderedMonths.length > 0 ? (
          orderedMonths.map((month) => (
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
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No visits found for the selected filters
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitsView;
