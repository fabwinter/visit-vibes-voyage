
// API configuration for Foursquare Places API

// Foursquare API key
export const FOURSQUARE_API_KEY = "fsq3ZIM9LvTXaHi20wbCYGVwVzN69G6lQh1aBX+plkPYZWI=";

// Mapbox API key - keep existing
export const MAPBOX_TOKEN = "pk.eyJ1IjoiZmFiaWFud2ludGVyYmluZSIsImEiOiJjbWFiMjU4NWgyNmhiMmxwdzFndzZpaWtsIn0.qip66iHah8qFMj1lrp2cpQ";

// Foursquare API base URL
export const FOURSQUARE_API_URL = "https://api.foursquare.com/v3";

// Use a more reliable CORS proxy - updated to fix CORS issues
export const PROXY_URL = "https://corsproxy.io/?";

// Food-related categories in Foursquare
export const FOOD_CATEGORIES = [
  "13000", // Food
  "13025", // Bakery
  "13029", // Breakfast spot
  "13032", // Café
  "13034", // Caribbean Restaurant
  "13065", // Restaurant
  "13338", // Nightlife spot
];

// Default headers for Foursquare API requests
export const getDefaultHeaders = () => ({
  Accept: "application/json",
  Authorization: `Bearer ${FOURSQUARE_API_KEY}`
});

// Search radius in meters (5km)
export const DEFAULT_SEARCH_RADIUS = 5000;

// Maximum number of results to return
export const MAX_RESULTS = 50;
