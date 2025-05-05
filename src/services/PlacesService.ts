
import { toast } from "sonner";
import { Venue } from "../types";

// Using the provided Google Places API key
const API_KEY = "AIzaSyAoqbocwE83Z3REe60z7dhN3Z2_aKnSJxc"; 

// Use a proper CORS proxy
// Note: For production, you should use your own proxy or Google Maps JavaScript API directly
const PROXY_URL = "https://corsproxy.io/?";

// Strictly food-related place types
const FOOD_PLACE_TYPES = [
  "restaurant", 
  "cafe", 
  "bakery", 
  "bar", 
  "food",
  "meal_takeaway",
  "meal_delivery"
];

// Not food-related types - explicit exclusions
const NON_FOOD_PLACE_TYPES = [
  "lodging",
  "hotel",
  "travel_agency",
  "real_estate_agency",
  "store",
  "gas_station",
  "car_dealer",
  "car_rental"
];

export interface PlacesSearchParams {
  query?: string;
  location?: { lat: number; lng: number };
  radius?: number;
  type?: string;
  pageToken?: string;
}

export const PlacesService = {
  async searchNearbyVenues(params: PlacesSearchParams): Promise<{ venues: Venue[], nextPageToken?: string }> {
    try {
      // Build the Places API URL
      const { location = { lat: -33.8688, lng: 151.2093 }, radius = 2000, type = "restaurant", query } = params;

      // Create base Google Places API URL
      let placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?`;
      placesUrl += `location=${location.lat},${location.lng}`;
      placesUrl += `&radius=${radius}`;
      placesUrl += `&type=${type}`;
      if (query) placesUrl += `&keyword=${encodeURIComponent(query)}`;
      if (params.pageToken) placesUrl += `&pagetoken=${params.pageToken}`;
      placesUrl += `&key=${API_KEY}`;
      
      // Add CORS proxy
      const url = `${PROXY_URL}${encodeURIComponent(placesUrl)}`;

      console.log("Fetching venues from Google Places API...");
      const response = await fetch(url);
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      // More strictly filter to only include food-related places
      const venues: Venue[] = data.results ? data.results
        .filter((place: any) => {
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
        })
        .map((place: any) => {
          return {
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            coordinates: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
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
          };
        }) : [];

      return { 
        venues,
        nextPageToken: data.next_page_token
      };
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast("Failed to fetch venues", { 
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      return { venues: [] };
    }
  },

  async searchPlaces(query: string, location: { lat: number; lng: number }): Promise<Venue[]> {
    try {
      // Create autocomplete search URL
      let placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?`;
      placesUrl += `input=${encodeURIComponent(query)}`;
      placesUrl += `&location=${location.lat},${location.lng}`;
      placesUrl += `&radius=50000`;
      placesUrl += `&types=establishment`;
      placesUrl += `&strictbounds=true`;
      placesUrl += `&key=${API_KEY}`;
      
      // Add CORS proxy
      const url = `${PROXY_URL}${encodeURIComponent(placesUrl)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Google Places API error: ${data.status}`);
      }
      
      // Process autocomplete predictions
      const predictions = data.predictions || [];
      
      // Convert predictions to a simplified venue format for display in autocomplete
      const venues: Venue[] = predictions.map((prediction: any) => ({
        id: prediction.place_id,
        name: prediction.structured_formatting.main_text,
        address: prediction.structured_formatting.secondary_text || prediction.description,
        coordinates: { lat: 0, lng: 0 }, // Will be populated after selection
        category: [],
        photos: []
      }));
      
      return venues;
    } catch (error) {
      console.error("Error searching places:", error);
      toast.error("Failed to search places");
      return [];
    }
  },

  async getVenueDetails(placeId: string): Promise<Venue | null> {
    try {
      // Create base URL
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,price_level,rating,types,geometry&key=${API_KEY}`;
      
      // Add CORS proxy
      const url = `${PROXY_URL}${encodeURIComponent(detailsUrl)}`;
      
      const response = await fetch(url);
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const place = data.result;
      
      return {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        photos: place.photos 
          ? place.photos.map((photo: any) => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${API_KEY}`
            )
          : [],
        website: place.website,
        hours: place.opening_hours?.weekday_text?.join(", "),
        phoneNumber: place.formatted_phone_number,
        priceLevel: place.price_level,
        category: place.types ? place.types.filter((type: string) => 
          !["point_of_interest", "establishment"].includes(type)
        ) : [],
      };
    } catch (error) {
      console.error("Error fetching venue details:", error);
      toast("Failed to fetch venue details", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      return null;
    }
  },

  generatePhotoURL(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${API_KEY}`;
  }
};
