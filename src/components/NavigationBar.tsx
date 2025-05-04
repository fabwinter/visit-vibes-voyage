
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Clock, Tags, User, Compass } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthContext } from '@/hooks/useAuthContext';

const NavigationBar = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(location.pathname === "/" ? "map" : location.pathname.substring(1));
  const isMobile = useIsMobile();
  const { isAuthenticated, setShowAuthModal } = useAuthContext();
  
  const handleProfileClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 flex ${isMobile ? 'justify-around' : 'justify-center'} bg-white border-t border-gray-200 ${isMobile ? 'p-1' : 'p-2'} z-50 shadow-lg`}>
      <Link 
        to="/" 
        className={`flex flex-col items-center ${isMobile ? 'p-2' : 'p-3 mx-2'} rounded-lg ${activeTab === 'map' ? 'text-visitvibe-primary bg-gray-100' : 'text-gray-500'}`}
        onClick={() => setActiveTab('map')}
      >
        <MapPin className={activeTab === 'map' ? 'text-visitvibe-primary' : 'text-gray-500'} />
        <span className="text-xs mt-1">Map</span>
      </Link>
      
      <Link 
        to="/explore" 
        className={`flex flex-col items-center ${isMobile ? 'p-2' : 'p-3 mx-2'} rounded-lg ${activeTab === 'explore' ? 'text-visitvibe-primary bg-gray-100' : 'text-gray-500'}`}
        onClick={() => setActiveTab('explore')}
      >
        <Compass className={activeTab === 'explore' ? 'text-visitvibe-primary' : 'text-gray-500'} />
        <span className="text-xs mt-1">Explore</span>
      </Link>
      
      <Link 
        to="/visits" 
        className={`flex flex-col items-center ${isMobile ? 'p-2' : 'p-3 mx-2'} rounded-lg ${activeTab === 'visits' ? 'text-visitvibe-primary bg-gray-100' : 'text-gray-500'}`}
        onClick={() => setActiveTab('visits')}
      >
        <Clock className={activeTab === 'visits' ? 'text-visitvibe-primary' : 'text-gray-500'} />
        <span className="text-xs mt-1">Visits</span>
      </Link>
      
      <Link 
        to="/wishlist" 
        className={`flex flex-col items-center ${isMobile ? 'p-2' : 'p-3 mx-2'} rounded-lg ${activeTab === 'wishlist' ? 'text-visitvibe-primary bg-gray-100' : 'text-gray-500'}`}
        onClick={() => setActiveTab('wishlist')}
      >
        <Tags className={activeTab === 'wishlist' ? 'text-visitvibe-primary' : 'text-gray-500'} />
        <span className="text-xs mt-1">Wishlist</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`flex flex-col items-center ${isMobile ? 'p-2' : 'p-3 mx-2'} rounded-lg ${activeTab === 'profile' ? 'text-visitvibe-primary bg-gray-100' : 'text-gray-500'}`}
        onClick={(e) => {
          setActiveTab('profile');
          handleProfileClick(e);
        }}
      >
        <User className={`${activeTab === 'profile' ? 'text-visitvibe-primary' : 'text-gray-500'} ${!isAuthenticated ? 'opacity-50' : ''}`} />
        <span className={`text-xs mt-1 ${!isAuthenticated ? 'opacity-50' : ''}`}>
          {isAuthenticated ? 'Profile' : 'Sign In'}
        </span>
      </Link>
    </nav>
  );
};

export default NavigationBar;
