
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useLocation = (initialLocation?: { lat: number; lng: number }) => {
  // Default to Sydney CBD, but this will be updated with user location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(
    initialLocation || { lat: -33.8688, lng: 151.2093 }
  );
  
  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      // Show loading toast
      const loadingToastId = toast.loading("Getting your current location...");
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          console.log("User location detected:", latitude, longitude);
          toast.dismiss(loadingToastId);
          toast.success("Location found", {
            description: "Showing food venues near you"
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast.dismiss(loadingToastId);
          toast.error("Could not access your location", {
            description: "Using default location. Check browser permissions."
          });
        },
        // Options for better geolocation
        { 
          enableHighAccuracy: true, 
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast("Geolocation is not supported by this browser", {
        description: "Using default location."
      });
    }
  }, []);
  
  return { userLocation, setUserLocation };
};
