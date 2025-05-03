
import { useState, useEffect, useRef } from 'react';
import { mockUserProfile, predefinedTags } from '../data/mockData';
import StarRating from '../components/StarRating';
import { Star, Award, MapPin, LogOut, Camera, Edit } from 'lucide-react';
import { Visit, UserProfile, Venue } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const ProfileView = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage
  useEffect(() => {
    // Load visits
    const storedVisits = localStorage.getItem('visits');
    if (storedVisits) {
      const parsedVisits = JSON.parse(storedVisits);
      setVisits(parsedVisits);
    }

    // Load venues
    const storedVenues = localStorage.getItem('venues');
    if (storedVenues) {
      setVenues(JSON.parse(storedVenues));
    }

    // Create profile from real data, or use mock as fallback
    const userName = localStorage.getItem('userName') || mockUserProfile.name;
    const userEmail = localStorage.getItem('userEmail') || mockUserProfile.email;
    const userPhoto = localStorage.getItem('userPhoto') || mockUserProfile.photo;

    setUserProfile({
      ...mockUserProfile,
      name: userName,
      email: userEmail,
      photo: userPhoto,
      visits: [],  // We'll calculate stats from the actual visits array
      savedVenues: [], // Not implemented yet
    });
  }, []);

  // Extract all tags from visits
  const allTags = visits.reduce((tags, visit) => {
    return [...tags, ...visit.tags];
  }, [] as string[]);

  // Count occurrences of each tag
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort tags by frequency
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

  // Calculate stats
  const totalVisits = visits.length;
  const uniqueVenues = new Set(visits.map(visit => visit.venueId)).size;
  const averageRating = visits.length > 0
    ? visits.reduce((sum, visit) => sum + visit.rating.overall, 0) / visits.length
    : 0;
  
  // Calculate badges
  const earnedBadges = [
    { 
      name: "Explorer", 
      description: "Visited 3+ unique venues", 
      icon: <MapPin className="w-5 h-5" />,
      earned: uniqueVenues >= 3
    },
    { 
      name: "Critic", 
      description: "Rated 5+ meals", 
      icon: <Star className="w-5 h-5" />,
      earned: visits.reduce((count, visit) => count + visit.dishes.length, 0) >= 5
    },
    { 
      name: "Regular", 
      description: "Visited the same place 3+ times", 
      icon: <Award className="w-5 h-5" />,
      earned: Object.values(
        visits.reduce((acc, visit) => {
          acc[visit.venueId] = (acc[visit.venueId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).some(count => count >= 3)
    },
  ];

  const handleLogout = () => {
    toast("This is a demo app", {
      description: "Logout functionality would be implemented with auth integration"
    });
  };

  const handleEditProfile = () => {
    // Simple profile editing
    const newName = prompt("Enter your name:", userProfile.name);
    if (newName && newName.trim() !== '') {
      localStorage.setItem('userName', newName);
      setUserProfile(prev => ({ ...prev, name: newName }));
      toast.success("Profile updated");
    }
  };
  
  // Handle photo upload
  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Process the uploaded photo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large", { description: "Please choose an image smaller than 5MB" });
      return;
    }
    
    // Create a FileReader to read the image as a data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoDataUrl = e.target?.result as string;
      if (photoDataUrl) {
        // Save to localStorage and update state
        localStorage.setItem('userPhoto', photoDataUrl);
        setUserProfile(prev => ({ ...prev, photo: photoDataUrl }));
        toast.success("Profile photo updated");
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Profile header */}
      <div className="flex items-center mb-6">
        <div className="relative">
          <Avatar className="w-20 h-20 border-2 border-visitvibe-primary">
            <AvatarImage 
              src={userProfile.photo || undefined}
              alt={userProfile.name} 
              className="object-cover"
            />
            <AvatarFallback>
              {userProfile.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Edit photo button */}
          <button 
            className="absolute bottom-0 right-0 bg-visitvibe-primary text-white rounded-full p-1 shadow-md"
            onClick={handlePhotoUpload}
          >
            <Camera size={16} />
          </button>
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
        
        <div className="ml-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{userProfile.name}</h1>
            <button 
              onClick={handleEditProfile}
              className="text-visitvibe-primary"
              aria-label="Edit profile"
            >
              <Edit size={16} />
            </button>
          </div>
          <p className="text-gray-500 text-sm">{userProfile.email}</p>
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
          <p className="text-2xl font-bold text-visitvibe-primary">{venues.length}</p>
          <p className="text-xs text-gray-500 mt-1">Found Places</p>
        </div>
      </div>
      
      {/* Badges */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Your Badges</h2>
        <div className="grid grid-cols-2 gap-3">
          {earnedBadges.map((badge) => (
            <div 
              key={badge.name} 
              className={`bg-white rounded-lg shadow p-3 flex items-center ${
                badge.earned ? '' : 'opacity-50'
              }`}
            >
              <div className={`
                p-2 rounded-full mr-3
                ${badge.earned 
                  ? 'bg-visitvibe-primary/10 text-visitvibe-primary' 
                  : 'bg-gray-200 text-gray-400'
                }
              `}>
                {badge.icon}
              </div>
              <div>
                <p className="font-medium">{badge.name}</p>
                <p className="text-xs text-gray-500">{badge.description}</p>
                {!badge.earned && (
                  <p className="text-xs text-gray-400 mt-1">Not earned yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* My Tags */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">My Tags</h2>
        {sortedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sortedTags.slice(0, 12).map((tag) => (
              <span key={tag} className="tag-badge">
                {tag} ({tagCounts[tag]})
              </span>
            ))}
            {sortedTags.length > 12 && (
              <span className="text-xs text-gray-500 self-end">
                +{sortedTags.length - 12} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No tags yet. Add tags when checking in to venues.
          </p>
        )}
      </div>
      
      {/* Settings */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Settings</h2>
        <div className="bg-white rounded-lg shadow divide-y">
          <button 
            className="w-full text-left py-3 px-4"
            onClick={handleEditProfile}
          >
            Edit Profile
          </button>
          <button className="w-full text-left py-3 px-4">Notifications</button>
          <button className="w-full text-left py-3 px-4">Privacy</button>
          <button 
            className="w-full text-left py-3 px-4 text-red-500 flex items-center"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
