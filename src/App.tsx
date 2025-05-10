
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import MapboxTokenInput from "./components/MapboxTokenInput";

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

const App = () => {
  const [mapboxToken, setMapboxToken] = useState(localStorage.getItem('mapbox_token') || '');
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    // Check if we have a Mapbox token stored
    const token = localStorage.getItem('mapbox_token');
    if (!token) {
      setShowTokenInput(true);
    } else {
      setMapboxToken(token);
    }
  }, []);

  const handleTokenSaved = (token: string) => {
    setMapboxToken(token);
    setShowTokenInput(false);
    
    // Refresh the page to apply the new token
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              {/* Show token input if no token is set */}
              <MapboxTokenInput
                isOpen={showTokenInput}
                onClose={() => setShowTokenInput(false)}
                onTokenSaved={handleTokenSaved}
              />
              
              <Routes>
                <Route path="/" element={<MapView />} />
                <Route path="/explore" element={<ExploreView />} />
                <Route path="/visits" element={<VisitsView />} />
                <Route path="/visit/:visitId" element={<VisitDetailsView />} />
                <Route path="/wishlist" element={<WishlistView />} />
                <Route path="/profile" element={<ProfileView />} />
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
