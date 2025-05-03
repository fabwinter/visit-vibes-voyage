
import { useState, useEffect } from 'react';
import { mockVisits, mockVenues } from '../data/mockData';
import VisitCard from '../components/VisitCard';
import VisitCalendar from '../components/VisitCalendar';
import { format, isAfter, isBefore } from 'date-fns';
import { Visit, Venue } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Share2 } from 'lucide-react';
import { toast } from "sonner";

const VisitsView = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});
  
  // Use state for visits to allow for new check-ins
  const [visits, setVisits] = useState<Visit[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  
  // Load visits from localStorage if available
  useEffect(() => {
    const storedVisits = localStorage.getItem('visits');
    if (storedVisits) {
      setVisits(JSON.parse(storedVisits));
    } else {
      // If no stored visits, use empty array
      setVisits([]);
    }
    
    // Get venues from localStorage or fallback to mock data
    const storedVenues = localStorage.getItem('venues');
    if (storedVenues) {
      setVenues(JSON.parse(storedVenues));
    } else {
      setVenues(mockVenues);
    }
  }, []);

  const getVenueName = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId);
    return venue ? venue.name : 'Unknown Venue';
  };

  const getVenueDetails = (venueId: string) => {
    return venues.find(v => v.id === venueId);
  };

  // Apply both filter and date filter
  const filteredVisits = visits.filter(visit => {
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
      case 'would visit again':
        return passesDateFilter && visit.wouldVisitAgain === true;
      case 'would not visit again':
        return passesDateFilter && visit.wouldVisitAgain === false;
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
  }, {} as Record<string, Visit[]>);

  // Order the months chronologically (most recent first)
  const orderedMonths = Object.keys(groupedVisits).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Navigate to visit details
  const handleVisitClick = (visitId: string) => {
    navigate(`/visit/${visitId}`);
  };
  
  // Share all visits
  const handleShareAllVisits = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Food Venue Visits",
        text: `I've visited ${visits.length} food venues. Check out my collection!`,
        url: window.location.href
      })
      .then(() => toast.success("Shared successfully"))
      .catch(error => console.error('Error sharing', error));
    } else {
      toast("Sharing not supported on this browser", {
        description: "Try copying the link directly"
      });
    }
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Visit History</h1>
        {visits.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShareAllVisits}
            className="flex items-center gap-1"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['all', 'recent', 'highest rated', 'lowest rated', 'would visit again', 'would not visit again'].map((filter) => (
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
        <VisitCalendar visits={visits} onDateFilterChange={setDateFilter} />
      </div>

      {/* Visit timeline */}
      <div className="space-y-8">
        {orderedMonths.length > 0 ? (
          orderedMonths.map((month) => (
            <div key={month}>
              <h2 className="text-lg font-semibold mb-3 border-b pb-2">{month}</h2>
              <div className="space-y-4">
                {groupedVisits[month].map((visit) => {
                  const venueName = getVenueName(visit.venueId);
                  const venueDetails = getVenueDetails(visit.venueId);
                  
                  return (
                    <div 
                      key={visit.id}
                      onClick={() => handleVisitClick(visit.id)}
                      className="cursor-pointer"
                    >
                      <VisitCard
                        visit={visit}
                        venueName={venueName}
                        venueDetails={venueDetails}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <MapPin className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No visits yet</h3>
              <p className="text-gray-500 mb-6 text-center">
                You haven't checked in anywhere yet. Start by finding a place on the map and checking in.
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-visitvibe-primary hover:bg-visitvibe-primary/90"
              >
                Find Places to Visit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitsView;
