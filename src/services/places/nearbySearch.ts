
import { API_KEY, PROXY_URL, FOOD_PLACE_TYPES } from "./config";
import { PlacesSearchParams, PlacesSearchResponse } from "./types";
import { generatePhotoURL } from "./utils";
import { Venue } from "@/types";
import { toast } from "sonner";
import { mockVenues } from "@/data/mockData";

// Search nearby venues
export const searchNearbyVenues = async (params: PlacesSearchParams): Promise<PlacesSearchResponse> => {
  try {
    console.log("Searching for nearby venues with params:", params);
    
    // Build API URL
    let apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?`;
    
    // Add location if available
    if (params.location) {
      apiUrl += `location=${params.location.lat},${params.location.lng}&`;
    }
    
    // Add radius (default 500m)
    apiUrl += `radius=${params.radius || 500}&`;
    
    // Add type if available
    if (params.type) {
      apiUrl += `type=${params.type}&`;
    }
    
    // Add page token if available for pagination
    if (params.pageToken) {
      apiUrl += `pagetoken=${params.pageToken}&`;
    }
    
    // Add API key
    apiUrl += `key=${API_KEY}`;
    
    // Make the API call via proxy to avoid CORS issues
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(apiUrl)}`);
    const data = await response.json();
    
    // Check for error
    if (data.error_message) {
      console.error("Places API error:", data.error_message);
      throw new Error(data.error_message);
    }

    // Check if we have valid results
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.log("Non-OK status:", data.status);
      throw new Error(`API returned status: ${data.status}`);
    }
    
    // If no results, return empty array
    if (data.results.length === 0) {
      return { venues: [], nextPageToken: undefined };
    }
    
    // Transform results to our Venue format
    const venues: Venue[] = data.results.map((place: any) => {
      // Generate photo URL if available
      const photos = place.photos
        ? place.photos.map((photo: any) => generatePhotoURL(photo.photo_reference))
        : [];
      
      // Process opening hours if available
      const hours = place.opening_hours?.open_now
        ? "Currently open"
        : "Hours not available";
        
      // Extract place types that match our food place types
      const category = place.types
        .filter((type: string) => FOOD_PLACE_TYPES.includes(type))
        .map((type: string) => {
          // Convert snake_case to Title Case
          return type
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        });
      
      return {
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        photos,
        hours,
        priceLevel: place.price_level,
        category,
        googleRating: place.rating || 0,
      };
    });
    
    // Return venues and next_page_token if available for pagination
    return {
      venues,
      nextPageToken: data.next_page_token,
    };
  } catch (error) {
    console.error("Error searching nearby venues:", error);
    
    // Return mock data instead
    console.log("Falling back to mock data");
    toast.error("API request failed, using mock data instead", { 
      description: error instanceof Error ? error.message : "Unknown error" 
    });
    
    // Return mock data with proper coordinates as fallback
    return {
      venues: mockVenues.map(venue => ({
        ...venue,
        // Ensure each mock venue has proper coordinates
        coordinates: venue.coordinates || { lat: -33.8688, lng: 151.2093 }
      })),
      nextPageToken: undefined,
    };
  }
};
