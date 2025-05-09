
import { toast } from "sonner";
import { 
  FOURSQUARE_API_URL, 
  PROXY_URL, 
  getDefaultHeaders, 
  FOOD_CATEGORIES, 
  DEFAULT_SEARCH_RADIUS,
  MAX_RESULTS
} from "./config";
import { FoursquareSearchParams, FoursquareResponse } from "./types";
import { Venue } from "@/types";
import { convertFoursquareToVenue, formatCategoryParam } from "./utils";
import { mockVenues } from "@/data/mockData";

export interface NearbySearchResponse {
  venues: Venue[];
  nextPageToken?: string;
}

// Search nearby venues
export const searchNearbyVenues = async (params: {
  location: { lat: number; lng: number };
  radius?: number;
  type?: string;
  pageToken?: string;
}): Promise<NearbySearchResponse> => {
  try {
    console.log("Searching for nearby venues with params:", params);
    
    // Build search parameters
    const searchParams: FoursquareSearchParams = {
      ll: `${params.location.lat},${params.location.lng}`,
      radius: params.radius || DEFAULT_SEARCH_RADIUS,
      categories: formatCategoryParam(FOOD_CATEGORIES),
      limit: MAX_RESULTS,
      sort: "DISTANCE" // Sort by distance to show closest venues first
    };

    // If we have a query/type, add it
    if (params.type && params.type !== "restaurant") {
      searchParams.query = params.type;
    }
    
    // Build the URL with query parameters
    const queryString = new URLSearchParams(searchParams as any).toString();
    const url = `${PROXY_URL}${FOURSQUARE_API_URL}/places/search?${queryString}`;
    
    console.log("Fetching venues from URL:", url);
    
    // Make the API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Make the API call
    const response = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error("API request failed with status:", response.status);
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data: FoursquareResponse = await response.json();
    console.log("API response received:", data);
    
    // Check for no results
    if (!data.results || data.results.length === 0) {
      console.log("No venues found in the area.");
      throw new Error("No venues found in this area");
    }
    
    // Convert results to our Venue format
    const venues: Venue[] = data.results.map(convertFoursquareToVenue);
    
    console.log(`Found ${venues.length} venues`);
    
    // Foursquare doesn't support pagination tokens like Google Places
    return { venues };
  } catch (error) {
    console.error("Error searching nearby venues:", error);
    
    // Only show toast if this isn't an abort error (timeout)
    if (!(error instanceof DOMException && error.name === 'AbortError')) {
      toast.error("Failed to fetch nearby venues, showing local data instead");
    }
    
    // Return mock data as fallback
    console.log("Using mock venues as fallback");
    
    // Simulate venues being near the requested location
    const localizedMockVenues = mockVenues.map(venue => {
      // Create a slight offset from the requested location to simulate real venues
      const latOffset = (Math.random() - 0.5) * 0.01;
      const lngOffset = (Math.random() - 0.5) * 0.01;
      
      return {
        ...venue,
        coordinates: {
          lat: params.location.lat + latOffset,
          lng: params.location.lng + lngOffset
        }
      };
    });
    
    // Return mock data instead of failing completely
    return { venues: localizedMockVenues };
  }
};
