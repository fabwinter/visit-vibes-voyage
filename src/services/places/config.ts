
// Google Places configuration (kept for compatibility)
export const API_KEY = "AIzaSyFakePlacesAPIKey"; 
export const PROXY_URL = "https://proxy-service-placeholder.com/places?url=";

// Place categories
export const FOOD_PLACE_TYPES = [
  "restaurant",
  "cafe", 
  "bakery", 
  "bar", 
  "food",
  "fast_food",
  "deli",
  "ice_cream"
];

export const NON_FOOD_PLACE_TYPES = [
  "store",
  "supermarket",
  "shopping_mall"
];

// Mapbox API configuration
export const MAPBOX_TOKEN = "pk.eyJ1IjoiZmFiaWFud2ludGVyYmluZSIsImEiOiJjbWFiMjU4NWgyNmhiMmxwdzFndzZpaWtsIn0.qip66iHah8qFMj1lrp2cpQ";

// Mapbox secret token (should be used server-side only)
export const MAPBOX_SECRET_TOKEN = "sk.eyJ1IjoiZmFiaWFud2ludGVyYmluZSIsImEiOiJjbWFiODhjaWsyOXVsMmtvb2xqZDFiYjltIn0.o5P8krstTtbBHoSZDyeJ5g";

// Food-related place categories for Mapbox
export const FOOD_PLACE_CATEGORIES = [
  "restaurant",
  "cafe", 
  "bakery", 
  "bar", 
  "food",
  "fast_food",
  "deli",
  "ice_cream"
];

// Default map style
export const DEFAULT_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";

// Default map position (Sydney, Australia)
export const DEFAULT_MAP_CENTER = { lat: -33.8688, lng: 151.2093 };
export const DEFAULT_ZOOM = 13;
