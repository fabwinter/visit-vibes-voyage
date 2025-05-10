
// API configuration for Google Places API

// Get the API key from Supabase secrets
export const API_KEY = "AIzaSyCm9Nv09xVWUXMjgkqy5vk_hwTS25OPt4Q"; 

// Use a proper CORS proxy
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
