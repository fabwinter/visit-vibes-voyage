
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

import Layout from "./components/Layout";
import MapView from "./pages/MapView";
import ExploreView from "./pages/ExploreView";
import VisitsView from "./pages/VisitsView";
import WishlistView from "./pages/WishlistView";
import ProfileView from "./pages/ProfileView";
import VisitDetailsView from "./pages/VisitDetailsView";
import MapSettingsView from "./pages/MapSettingsView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry failed queries once
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    // Redirect to home if not authenticated
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>              
              <Routes>
                <Route path="/" element={<MapView />} />
                <Route path="/explore" element={<ExploreView />} />
                <Route path="/visits" element={
                  <ProtectedRoute>
                    <VisitsView />
                  </ProtectedRoute>
                } />
                <Route path="/visit/:visitId" element={
                  <ProtectedRoute>
                    <VisitDetailsView />
                  </ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <WishlistView />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfileView />
                  </ProtectedRoute>
                } />
                <Route path="/map-settings" element={<MapSettingsView />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
