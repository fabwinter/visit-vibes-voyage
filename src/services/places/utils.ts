import { API_KEY, PROXY_URL } from "./config";
import { Venue } from "@/types";
import { FOOD_PLACE_TYPES, NON_FOOD_PLACE_TYPES } from "./config";

// Build a URL for the Places API requests
export const buildPlacesApiUrl = (endpoint: string, params: Record<string, string>): string => {
  const baseUrl = `https://maps.googleapis.com/maps/api/place/${endpoint}/json?`;
  
  const queryParams = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  const apiUrl = `${baseUrl}${queryParams}&key=${API_KEY}`;
  
  // Add CORS proxy
  return `${PROXY_URL}${encodeURIComponent(apiUrl)}`;
};

// Convert Google Places result to our Venue type
export const convertPlaceToVenue = (place: any): Venue => {
  return {
    id: place.place_id,
    name: place.name,
    address: place.vicinity || place.formatted_address,
    coordinates: {
      lat: place.geometry?.location.lat,
      lng: place.geometry?.location.lng,
    },
    photos: place.photos 
      ? place.photos.map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`
        )
      : [],
    priceLevel: place.price_level,
    category: place.types ? place.types.filter((type: string) => 
      // Keep only food-related categories for display
      FOOD_PLACE_TYPES.includes(type) || 
      !["point_of_interest", "establishment", "food", "store"].includes(type)
    ) : [],
    website: place.website,
    hours: place.opening_hours?.weekday_text?.join(", "),
    phoneNumber: place.formatted_phone_number
  };
};

// Filter Google Places results to only include food venues
export const filterFoodVenues = (results: any[]): any[] => {
  return results.filter((place: any) => {
    // Only include if:
    // 1. It has at least one food-related type
    const hasFoodType = place.types.some((type: string) => 
      FOOD_PLACE_TYPES.includes(type)
    );
    
    // 2. AND it doesn't have non-food types
    const hasNonFoodType = place.types.some((type: string) => 
      NON_FOOD_PLACE_TYPES.includes(type)
    );
    
    return hasFoodType && !hasNonFoodType;
  });
};

// Generate photo URL from photo reference
export const generatePhotoURL = (photoReference: string, maxWidth: number = 400): string => {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${API_KEY}`;
};
