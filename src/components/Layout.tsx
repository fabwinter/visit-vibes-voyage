
import { ReactNode, useState } from 'react';
import NavigationBar from './NavigationBar';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';
import AuthModal from './auth/AuthModal';
import { useAuth, ExtendedUser } from '@/hooks/useAuth';
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
import { toast } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
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
    toast.success("Logged out successfully");
  };

  const navigateToProfile = () => {
    navigate('/profile');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white p-3 shadow-sm fixed top-0 left-0 right-0 z-40 flex items-center justify-between">
        <h1 className="text-xl font-bold text-visitvibe-primary">
          VisitVibe
        </h1>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                  <Avatar className="h-8 w-8">
                    {user?.photo ? (
                      <AvatarImage src={user.photo} alt={user.name || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-visitvibe-primary text-white">
                        {getInitials(user?.name || 'User')}
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
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={openSignIn}>
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
