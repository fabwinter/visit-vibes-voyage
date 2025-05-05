
import { API_KEY, PROXY_URL, FOOD_PLACE_TYPES } from "./config";
import { PlacesSearchParams, PlacesSearchResponse } from "./types";
import { generatePhotoURL } from "./utils";
import { Venue } from "@/types";

// Search nearby venues
export const searchNearbyVenues = async (params: PlacesSearchParams): Promise<PlacesSearchResponse> => {
  try {
    // Build API URL
    let apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?`;
    
    // Add location if available
    if (params.location) {
      apiUrl += `location=${params.location.lat},${params.location.lng}&`;
    }
    
    // Add radius (default 500m, now using 2000m as requested)
    apiUrl += `radius=${params.radius || 2000}&`;
    
    // Use multiple types for food venues
    // Note: Google Places API only allows one type per request
    // We'll use the most general food type and filter results later
    if (params.type) {
      apiUrl += `type=${params.type}&`;
    } else {
      apiUrl += `type=restaurant&`; // Default to restaurant as it's most common
    }
    
    // Add keyword to include all food establishments
    apiUrl += `keyword=food,cafe,restaurant,bar&`;
    
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
      // This helps categorize the venue correctly
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
    throw error;
  }
};
