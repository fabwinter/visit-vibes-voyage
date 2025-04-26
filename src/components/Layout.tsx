
import { ReactNode } from 'react';
import NavigationBar from './NavigationBar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white p-4 shadow-sm fixed top-0 left-0 right-0 z-40 flex items-center">
        <h1 className="text-xl font-bold text-visitvibe-primary">
          VisitVibe
        </h1>
      </header>
      <main className="pt-16 pb-20">
        {children}
      </main>
      <NavigationBar />
    </div>
  );
};

export default Layout;
