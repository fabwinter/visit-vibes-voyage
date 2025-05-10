
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

import Layout from "./components/Layout";
import MapView from "./pages/MapView";
import ExploreView from "./pages/ExploreView";
import VisitsView from "./pages/VisitsView";
import WishlistView from "./pages/WishlistView";
import ProfileView from "./pages/ProfileView";
import VisitDetailsView from "./pages/VisitDetailsView";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/explore" element={<ExploreView />} />
              <Route path="/visits" element={<VisitsView />} />
              <Route path="/visit/:visitId" element={<VisitDetailsView />} />
              <Route path="/wishlist" element={<WishlistView />} />
              <Route path="/profile" element={<ProfileView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
