
import { mockUserProfile, predefinedTags } from '../data/mockData';
import StarRating from '../components/StarRating';
import { Star, Award, MapPin } from 'lucide-react';

const ProfileView = () => {
  const { name, photo, visits, tags, savedVenues } = mockUserProfile;
  
  // Calculate stats
  const totalVisits = visits.length;
  const uniqueVenues = new Set(visits.map(visit => visit.venueId)).size;
  const averageRating = visits.reduce((sum, visit) => sum + visit.rating.overall, 0) / totalVisits;
  
  // Calculate badges
  const earnedBadges = [
    { name: "Explorer", description: "Visited 3+ unique venues", icon: <MapPin className="w-5 h-5" /> },
    { name: "Critic", description: "Rated 5+ meals", icon: <Star className="w-5 h-5" /> },
  ];
  
  return (
    <div className="px-4 pt-6 pb-24">
      {/* Profile header */}
      <div className="flex items-center mb-6">
        <img 
          src={photo || 'https://placehold.co/100'} 
          alt={name} 
          className="w-20 h-20 rounded-full object-cover border-2 border-visitvibe-primary"
        />
        <div className="ml-4">
          <h1 className="text-2xl font-bold">{name}</h1>
          <div className="flex items-center mt-1">
            <StarRating rating={averageRating} size="sm" />
            <span className="text-gray-500 text-sm ml-2">Average rating</span>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-3 text-center">
          <p className="text-2xl font-bold text-visitvibe-primary">{totalVisits}</p>
          <p className="text-xs text-gray-500 mt-1">Total Visits</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 text-center">
          <p className="text-2xl font-bold text-visitvibe-primary">{uniqueVenues}</p>
          <p className="text-xs text-gray-500 mt-1">Unique Venues</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 text-center">
          <p className="text-2xl font-bold text-visitvibe-primary">{savedVenues.length}</p>
          <p className="text-xs text-gray-500 mt-1">Saved Places</p>
        </div>
      </div>
      
      {/* Badges */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Your Badges</h2>
        <div className="grid grid-cols-2 gap-3">
          {earnedBadges.map((badge) => (
            <div key={badge.name} className="bg-white rounded-lg shadow p-3 flex items-center">
              <div className="bg-visitvibe-primary/10 p-2 rounded-full text-visitvibe-primary mr-3">
                {badge.icon}
              </div>
              <div>
                <p className="font-medium">{badge.name}</p>
                <p className="text-xs text-gray-500">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* My Tags */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">My Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 12).map((tag) => (
            <span key={tag} className="tag-badge">
              {tag}
            </span>
          ))}
          {tags.length > 12 && (
            <span className="text-xs text-gray-500 self-end">
              +{tags.length - 12} more
            </span>
          )}
        </div>
      </div>
      
      {/* Settings */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Settings</h2>
        <div className="bg-white rounded-lg shadow divide-y">
          <button className="w-full text-left py-3 px-4">Edit Profile</button>
          <button className="w-full text-left py-3 px-4">Notifications</button>
          <button className="w-full text-left py-3 px-4">Privacy</button>
          <button className="w-full text-left py-3 px-4 text-red-500">Log Out</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
