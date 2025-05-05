
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, User, Compass } from 'lucide-react';

const NavigationBar = () => {
  const [activeTab, setActiveTab] = useState<string>('map');

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around bg-white border-t border-gray-200 p-2 z-50">
      <Link 
        to="/" 
        className={`flex flex-col items-center p-2 ${activeTab === 'map' ? 'text-visitvibe-primary' : 'text-gray-500'}`}
        onClick={() => setActiveTab('map')}
      >
        <MapPin className={activeTab === 'map' ? 'text-visitvibe-primary' : 'text-gray-500'} />
        <span className="text-xs mt-1">Map</span>
      </Link>
      
      <Link 
        to="/explore" 
        className={`flex flex-col items-center p-2 ${activeTab === 'explore' ? 'text-visitvibe-primary' : 'text-gray-500'}`}
        onClick={() => setActiveTab('explore')}
      >
        <Compass className={activeTab === 'explore' ? 'text-visitvibe-primary' : 'text-gray-500'} />
        <span className="text-xs mt-1">Explore</span>
      </Link>
      
      <Link 
        to="/visits" 
        className={`flex flex-col items-center p-2 ${activeTab === 'visits' ? 'text-visitvibe-primary' : 'text-gray-500'}`}
        onClick={() => setActiveTab('visits')}
      >
        <Clock className={activeTab === 'visits' ? 'text-visitvibe-primary' : 'text-gray-500'} />
        <span className="text-xs mt-1">Visits</span>
      </Link>
      
      <Link 
        to="/ratings" 
        className={`flex flex-col items-center p-2 ${activeTab === 'ratings' ? 'text-visitvibe-primary' : 'text-gray-500'}`}
        onClick={() => setActiveTab('ratings')}
      >
        <Star className={activeTab === 'ratings' ? 'text-visitvibe-primary' : 'text-gray-500'} />
        <span className="text-xs mt-1">Ratings</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`flex flex-col items-center p-2 ${activeTab === 'profile' ? 'text-visitvibe-primary' : 'text-gray-500'}`}
        onClick={() => setActiveTab('profile')}
      >
        <User className={activeTab === 'profile' ? 'text-visitvibe-primary' : 'text-gray-500'} />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </nav>
  );
};

export default NavigationBar;
