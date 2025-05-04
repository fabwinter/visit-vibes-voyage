
// Google Places API configuration

// API key to use for Places API requests
export const API_KEY = process.env.GOOGLE_MAPS_API_KEY || ""; 

// Proxy URL to avoid CORS issues when calling the API
export const PROXY_URL = "/api/places-proxy?url=";

// Types of food places we want to show in the app
export const FOOD_PLACE_TYPES = [
  "restaurant",
  "cafe",
  "bar",
  "bakery",
  "meal_takeaway",
  "meal_delivery",
  "food",
  "night_club", // Often serves food
  "supermarket", // For prepared foods
  "convenience_store", // For prepared foods
  "grocery_or_supermarket", // For prepared foods
  "liquor_store", // For specialty food and drink
  "coffee_shop",
  "tea",
  "dessert",
  "ice_cream"
];
