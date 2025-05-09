
import { useState, useEffect, useRef } from 'react';
import { predefinedTags } from '../data/mockData';
import StarRating from '../components/StarRating';
import { Star, Award, MapPin, LogOut, Camera, Edit, UserRound } from 'lucide-react';
import { Visit, Venue } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth, ExtendedUser } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ProfileView = () => {
  const { user, isAuthenticated, logout, updateUserProfile } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [name, setName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage
  useEffect(() => {
    // Load visits
    const storedVisits = localStorage.getItem('visits');
    if (storedVisits) {
      try {
        const parsedVisits = JSON.parse(storedVisits);
        setVisits(parsedVisits);
      } catch (error) {
        console.error("Failed to parse visits", error);
      }
    }

    // Load venues
    const storedVenues = localStorage.getItem('venues');
    if (storedVenues) {
      try {
        setVenues(JSON.parse(storedVenues));
      } catch (error) {
        console.error("Failed to parse venues", error);
      }
    }
    
    // Initialize name from user
    if (user && user.name) {
      setName(user.name);
    }
  }, [user]);

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
    logout();
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode && user && name !== user.name) {
      saveProfileChanges();
    }
  };

  const saveProfileChanges = async () => {
    try {
      await updateUserProfile({ name });
      toast.success("Profile updated");
      setEditMode(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Update profile error:", error);
    }
  };
  
  // Handle photo upload
  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Process the uploaded photo
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large", { description: "Please choose an image smaller than 5MB" });
      return;
    }
    
    // Create a FileReader to read the image as a data URL
    const reader = new FileReader();
    reader.onload = async (e) => {
      const photoDataUrl = e.target?.result as string;
      if (photoDataUrl) {
        try {
          await updateUserProfile({ photo: photoDataUrl });
          toast.success("Profile photo updated");
        } catch (error) {
          toast.error("Failed to update profile photo");
        }
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file");
    };
    reader.readAsDataURL(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-132px)] p-4">
        <UserRound className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Not Signed In</h1>
        <p className="text-gray-500 mb-6 text-center">
          Please sign in to view your profile
        </p>
        <Button onClick={() => {}}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Profile header */}
      <div className="flex items-center mb-6">
        <div className="relative">
          <Avatar className="w-20 h-20 border-2 border-visitvibe-primary">
            <AvatarImage 
              src={user?.photo || undefined}
              alt={user?.name || ''} 
              className="object-cover"
            />
            <AvatarFallback>
              {(user?.name || 'U').slice(0, 2).toUpperCase()}
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
        
        <div className="ml-4 flex-1">
          {editMode ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-[200px]"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
              <button 
                onClick={toggleEditMode}
                className="text-visitvibe-primary"
                aria-label="Edit profile"
              >
                <Edit size={16} />
              </button>
            </div>
          )}
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="flex items-center mt-1">
            <StarRating rating={averageRating} size="sm" />
            <span className="text-gray-500 text-sm ml-2">Average rating</span>
          </div>
          {editMode && (
            <Button size="sm" onClick={toggleEditMode} className="mt-2">
              Save
            </Button>
          )}
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
            onClick={toggleEditMode}
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
