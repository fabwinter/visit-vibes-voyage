
import { ReactNode, useState } from 'react';
import NavigationBar from './NavigationBar';
import { Button } from './ui/button';
import { UserIcon } from 'lucide-react';
import AuthModal from './auth/AuthModal';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin');
  
  const openSignIn = () => {
    setAuthType('signin');
    setAuthModalOpen(true);
  };
  
  const openSignUp = () => {
    setAuthType('signup');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white p-3 shadow-sm fixed top-0 left-0 right-0 z-40 flex items-center justify-between">
        <h1 className="text-xl font-bold text-visitvibe-primary">
          VisitVibe
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openSignIn}>
            Sign In
          </Button>
          <Button size="sm" onClick={openSignUp}>
            Sign Up
          </Button>
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
