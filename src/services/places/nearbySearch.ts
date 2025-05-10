
import { SUPABASE_URL, FOOD_CATEGORY_IDS } from "./config";
import { PlacesSearchParams, PlacesSearchResponse } from "./types";
import { Venue } from "@/types";
import { toast } from "sonner";
import { mockVenues } from "@/data/mockData";

// Search nearby venues using Foursquare via edge function
export const searchNearbyVenues = async (params: PlacesSearchParams): Promise<PlacesSearchResponse> => {
  try {
    console.log("Searching for nearby venues with params:", params);
    
    if (!params.location) {
      throw new Error("Location is required for nearby search");
    }
    
    // Build query parameters for the edge function
    const queryParams = new URLSearchParams({
      lat: params.location.lat.toString(),
      lng: params.location.lng.toString(),
      radius: (params.radius || 2000).toString(),
      limit: "20",
      categoryId: FOOD_CATEGORY_IDS.join(',')
    });
    
    // Add page token if available for pagination (using as offset)
    if (params.pageToken) {
      queryParams.append('offset', params.pageToken);
    }
    
    // Make request to our edge function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/venues-search?${queryParams.toString()}`);
    
    // Check for errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Edge function error:", response.status, errorText);
      throw new Error(`Failed to fetch venues: ${response.status}`);
    }
    
    const data = await response.json();
    
    // If no results, return empty array
    if (!data.venues || data.venues.length === 0) {
      return { venues: [], nextPageToken: undefined };
    }
    
    // The edge function already transforms the venue data to our format
    return {
      venues: data.venues,
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    console.error("Error searching nearby venues:", error);
    
    // Return mock data instead
    console.log("Falling back to mock data");
    toast.error("API request failed, using mock data instead", { 
      description: error instanceof Error ? error.message : "Unknown error" 
    });
    
    // Return mock data with proper coordinates as fallback
    return {
      venues: mockVenues.map(venue => ({
        ...venue,
        // Ensure each mock venue has proper coordinates
        coordinates: venue.coordinates || { lat: -33.8688, lng: 151.2093 }
      })),
      nextPageToken: undefined,
    };
  }
};
