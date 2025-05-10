
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Compass, CalendarCheck, BookmarkCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';

const NavigationBar: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    {
      to: '/map',
      label: 'Map',
      icon: <MapPin className="h-5 w-5" />
    },
    {
      to: '/explore',
      label: 'Explore',
      icon: <Compass className="h-5 w-5" />
    },
    {
      to: '/visits',
      label: 'Visits',
      icon: <CalendarCheck className="h-5 w-5" />
    },
    {
      to: '/wishlist',
      label: 'Wishlist',
      icon: <BookmarkCheck className="h-5 w-5" />
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: <User className="h-5 w-5" />
    }
  ];

  const closeMenu = () => setIsMenuOpen(false);
  
  return (
    <nav className="w-full bg-white border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-visitvibe-primary rounded-full p-1.5">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">VisitVibe</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}>
                <Button 
                  variant={isActive(link.to) ? "default" : "ghost"}
                  className="flex items-center space-x-1"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Button>
              </Link>
            ))}
            
            {!user && (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="ml-2">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Mobile Navigation - Hamburger */}
        {isMobile && (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
                  <line x1="4" x2="20" y1="12" y2="12"></line>
                  <line x1="4" x2="20" y1="6" y2="6"></line>
                  <line x1="4" x2="20" y1="18" y2="18"></line>
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map(link => (
                  <Link 
                    key={link.to} 
                    to={link.to} 
                    onClick={closeMenu}
                    className={`flex items-center space-x-3 p-2 rounded-md ${
                      isActive(link.to) 
                        ? 'bg-slate-100 text-visitvibe-primary font-medium' 
                        : 'text-gray-700 hover:bg-slate-50'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
                
                {!user && (
                  <Link to="/auth" onClick={closeMenu}>
                    <Button className="w-full mt-4">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
