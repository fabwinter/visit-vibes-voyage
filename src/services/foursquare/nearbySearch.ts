
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
    const url = `${PROXY_URL}${encodeURIComponent(`${FOURSQUARE_API_URL}/places/search?${queryString}`)}`;
    
    // Make the API call
    const response = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data: FoursquareResponse = await response.json();
    
    // Check for no results
    if (!data.results || data.results.length === 0) {
      console.log("No venues found in the area.");
      return { venues: [] };
    }
    
    // Convert results to our Venue format
    const venues: Venue[] = data.results.map(convertFoursquareToVenue);
    
    console.log(`Found ${venues.length} venues`);
    
    // Foursquare doesn't support pagination tokens like Google Places,
    // so we don't return a nextPageToken
    return { venues };
  } catch (error) {
    console.error("Error searching nearby venues:", error);
    
    toast.error("Failed to fetch nearby venues", { 
      description: error instanceof Error ? error.message : "Unknown error" 
    });
    
    return { venues: [] };
  }
};
