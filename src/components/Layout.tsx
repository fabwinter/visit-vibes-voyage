
import { ReactNode } from 'react';
import NavigationBar from './NavigationBar';
import { useIsMobile } from '../hooks/use-mobile';
import { Button } from './ui/button';
import AuthModal from './auth/AuthModal';
import { useAuthContext } from '@/hooks/useAuthContext';
import { User, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const { isAuthenticated, user, showAuthModal, setShowAuthModal, logout } = useAuthContext();
  
  const handleSignInClick = () => {
    setShowAuthModal(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white p-3 shadow-sm fixed top-0 left-0 right-0 z-40 flex items-center justify-between">
        <h1 className="text-xl font-bold text-visitvibe-primary">
          VisitVibe
        </h1>
        {!isMobile && (
          <div className="flex gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user?.name || 'Profile'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignInClick} 
                  className="text-sm text-gray-600 hover:text-visitvibe-primary"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleSignInClick} 
                  className="bg-visitvibe-primary text-white px-3 py-1 rounded-full text-sm"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        )}
      </header>
      <main className="flex-1 pt-14 pb-16 overflow-y-auto md:pb-0">
        {children}
      </main>
      <NavigationBar />
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Layout;
