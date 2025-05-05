
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, Mail, LogOut, Clock, Tags, MapPin } from "lucide-react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useVisitData } from "@/hooks/useVisitData";

const ProfileView = () => {
  const { user, isAuthenticated, logout, setShowAuthModal } = useAuthContext();
  const { wishlistItems } = useWishlist();
  const { visits } = useVisitData();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If not logged in, show auth modal
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated, setShowAuthModal]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  if (!isAuthenticated || !user) {
    return (
      <div className="container max-w-md mx-auto p-4 h-full flex flex-col items-center justify-center">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Sign in Required</CardTitle>
            <CardDescription>
              Please sign in to view your profile
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setShowAuthModal(true)} className="w-full">
              Sign in
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-md mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <User className="h-12 w-12 text-visitvibe-primary" />
            </div>
            <h2 className="text-xl font-bold">{user.name}</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-gray-500" />
            <span>{user.email}</span>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="col-span-1">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-visitvibe-primary" />
              <CardTitle className="text-lg">Visits</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{visits.length}</p>
            <p className="text-sm text-gray-500">Places visited</p>
          </CardContent>
          <CardFooter className="p-2">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/visits')}>
              View All
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center space-x-2">
              <Tags className="h-5 w-5 text-visitvibe-primary" />
              <CardTitle className="text-lg">Wishlist</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{wishlistItems.length}</p>
            <p className="text-sm text-gray-500">Saved places</p>
          </CardContent>
          <CardFooter className="p-2">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/wishlist')}>
              View All
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Button 
        onClick={handleLogout} 
        variant="destructive" 
        className="w-full flex items-center justify-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
};

export default ProfileView;
