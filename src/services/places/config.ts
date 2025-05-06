
// API configuration for Google Places API

// Using the provided Google Places API key - NOTE: This is being deprecated in favor of Mapbox
export const API_KEY = "AIzaSyAoqbocwE83Z3REe60z7dhN3Z2_aKnSJxc"; 

// Mapbox API key - updated to the latest key
export const MAPBOX_TOKEN = "pk.eyJ1IjoiZmFiaWFud2ludGVyYmluZSIsImEiOiJjbWFiMjU4NWgyNmhiMmxwdzFndzZpaWtsIn0.qip66iHah8qFMj1lrp2cpQ";

// Use a proper CORS proxy
// Note: For production, you should use your own proxy or Google Maps JavaScript API directly
export const PROXY_URL = "https://corsproxy.io/?";

// Strictly food-related place types
export const FOOD_PLACE_TYPES = [
  "restaurant", 
  "cafe", 
  "bakery", 
  "bar", 
  "food",
  "meal_takeaway",
  "meal_delivery"
];

// Not food-related types - explicit exclusions
export const NON_FOOD_PLACE_TYPES = [
  "lodging",
  "hotel",
  "travel_agency",
  "real_estate_agency",
  "store",
  "gas_station",
  "car_dealer",
  "car_rental"
];
