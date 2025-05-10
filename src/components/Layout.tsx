
import { ReactNode, useState } from 'react';
import NavigationBar from './NavigationBar';
import { Button } from './ui/button';
import { LogOut, Menu, User, X } from 'lucide-react';
import AuthModal from './auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const openSignIn = () => {
    setAuthType('signin');
    setAuthModalOpen(true);
  };
  
  const openSignUp = () => {
    setAuthType('signup');
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  const navigateToProfile = () => {
    navigate('/profile');
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.substring(0, 2).toUpperCase();
    }
    return 'US'; // Default: User
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white p-3 shadow-sm fixed top-0 left-0 right-0 z-40 flex items-center justify-between">
        <div className="flex items-center">
          <h1 
            className="text-xl font-bold text-visitvibe-primary cursor-pointer" 
            onClick={() => navigate('/')}
          >
            VisitVibe
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menu">
                    {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <div className="flex flex-col py-4 space-y-4">
                    <div className="flex items-center px-4 py-2">
                      <Avatar className="h-10 w-10 mr-3">
                        {user?.photo ? (
                          <AvatarImage src={user.photo} alt={user.name || 'User'} />
                        ) : (
                          <AvatarFallback className="bg-visitvibe-primary text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.name || 'User'}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start px-4" 
                        onClick={() => {
                          navigateToProfile();
                          setIsMenuOpen(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start px-4 text-red-500 hover:text-red-600 hover:bg-red-50" 
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Desktop dropdown menu */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                      <Avatar className="h-8 w-8">
                        {user?.photo ? (
                          <AvatarImage src={user.photo} alt={user.name || 'User'} />
                        ) : (
                          <AvatarFallback className="bg-visitvibe-primary text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{user?.name || 'User'}</DropdownMenuLabel>
                    <DropdownMenuItem onClick={navigateToProfile}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="hidden sm:flex" onClick={openSignIn}>
                Sign In
              </Button>
              <Button size="sm" onClick={openSignUp}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>
      <main className="flex-1 pt-14 pb-16 overflow-y-auto">
        {children}
      </main>
      <NavigationBar />
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialView={authType}
      />
    </div>
  );
};

export default Layout;
