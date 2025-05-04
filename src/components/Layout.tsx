
import { ReactNode } from 'react';
import NavigationBar from './NavigationBar';
import { useIsMobile } from '../hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white p-3 shadow-sm fixed top-0 left-0 right-0 z-40 flex items-center justify-between">
        <h1 className="text-xl font-bold text-visitvibe-primary">
          VisitVibe
        </h1>
        {!isMobile && (
          <div className="flex gap-2">
            <button className="text-sm text-gray-600 hover:text-visitvibe-primary">Sign In</button>
            <button className="bg-visitvibe-primary text-white px-3 py-1 rounded-full text-sm">Sign Up</button>
          </div>
        )}
      </header>
      <main className="flex-1 pt-14 pb-16 overflow-y-auto md:pb-0">
        {children}
      </main>
      <NavigationBar />
    </div>
  );
};

export default Layout;
