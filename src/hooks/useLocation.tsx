
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useLocation = (initialLocation?: { lat: number; lng: number }) => {
  // Default to Sydney CBD, but this will be updated with user location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(
    initialLocation || { lat: -33.8688, lng: 151.2093 }
  );
  
  // Get user's current location
  useEffect(() => {
    const getLocation = () => {
      console.log("Attempting to get user location...");
      
      if (navigator.geolocation) {
        // Show loading toast
        const loadingToastId = toast.loading("Getting your current location...");
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("User location detected:", latitude, longitude);
            
            // Update the location state
            setUserLocation({ lat: latitude, lng: longitude });
            
            // Dismiss loading toast and show success
            toast.dismiss(loadingToastId);
            toast.success("Location found", {
              description: "Showing food venues near you"
            });
          },
          (error) => {
            console.error("Error getting user location:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            
            let errorMessage = "Could not access your location";
            
            // Provide more specific error messages
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied. Please enable location services.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable.";
                break;
              case error.TIMEOUT:
                errorMessage = "Location request timed out.";
                break;
              default:
                errorMessage = `Location error: ${error.message}`;
            }
            
            // Dismiss loading toast and show error
            toast.dismiss(loadingToastId);
            toast.error(errorMessage, {
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
        console.error("Geolocation is not supported by this browser");
        toast.error("Geolocation is not supported by this browser", {
          description: "Using default location."
        });
      }
    };
    
    // Call the function to get location
    getLocation();
    
  }, []);
  
  return { userLocation, setUserLocation };
};
