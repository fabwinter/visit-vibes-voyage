
import { useState } from 'react';
import { mockVisits, mockVenues } from '../data/mockData';
import StarRating from '../components/StarRating';
import VenueCard from '../components/VenueCard';

const RatingsView = () => {
  const [selectedCategory, setSelectedCategory] = useState('overall');

  // Group venues by rating
  const ratingCategories = [
    { id: 'overall', name: 'Overall' },
    { id: 'food', name: 'Food' },
    { id: 'service', name: 'Service' },
    { id: 'value', name: 'Value' },
    { id: 'ambiance', name: 'Ambiance' },
  ];

  // Get all venues with their most recent visit rating
  const venuesWithRatings = mockVenues.map(venue => {
    const visits = mockVisits.filter(visit => visit.venueId === venue.id);
    // Sort by date (newest first)
    const sortedVisits = [...visits].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const lastVisit = sortedVisits[0];
    
    return {
      venue,
      lastVisit,
      rating: lastVisit?.rating[selectedCategory as keyof typeof lastVisit.rating] as number || 0
    };
  }).filter(item => item.lastVisit); // Only include venues with visits
  
  // Sort by the selected rating category (highest first)
  const sortedVenues = [...venuesWithRatings].sort((a, b) => b.rating - a.rating);
  
  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Your Ratings</h1>
      
      {/* Rating category selector */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {ratingCategories.map(category => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-visitvibe-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Top Rated */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Your Top Rated</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedVenues.slice(0, 2).map(({ venue, lastVisit }) => (
            <div key={venue.id} className="relative">
              <VenueCard venue={venue} lastVisit={lastVisit} />
              <div className="absolute top-4 left-4 bg-black bg-opacity-60 rounded-full p-1">
                <StarRating rating={lastVisit.rating[selectedCategory as keyof typeof lastVisit.rating] as number} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* All Ratings */}
      <div>
        <h2 className="text-lg font-semibold mb-3">All Ratings</h2>
        <div className="space-y-3">
          {sortedVenues.map(({ venue, lastVisit, rating }) => (
            <div 
              key={venue.id} 
              className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
            >
              <div>
                <h3 className="font-medium">{venue.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Last visit: {new Date(lastVisit.timestamp).toLocaleDateString()}
                </p>
              </div>
              <StarRating rating={rating} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingsView;
