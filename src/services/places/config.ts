
// API configuration for Foursquare Places API

// We'll use edge functions instead of direct API access
export const API_KEY = ""; // Not used directly in frontend anymore

// Add this for backward compatibility
export const MAPBOX_TOKEN = "";

// Use Supabase API URLs
export const SUPABASE_URL = "https://ufoousnidesoulsaqdes.supabase.co";

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

// Foursquare category IDs for food places
export const FOOD_CATEGORY_IDS = [
  "13000", // Food
  "13065", // Restaurant
  "13032", // Café
  "13003", // Bar
  "13034", // Coffee Shop
  "13035", // Dessert Shop
  "13040", // Fast Food Restaurant
  "13046", // Food Truck
  "13145", // Bakery
];
