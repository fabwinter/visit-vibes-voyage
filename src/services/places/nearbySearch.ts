
import { toast } from "sonner";
import { PlacesSearchParams, PlacesSearchResponse } from "./types";
import { buildPlacesApiUrl, convertPlaceToVenue, filterFoodVenues } from "./utils";

export const searchNearbyVenues = async (params: PlacesSearchParams): Promise<PlacesSearchResponse> => {
  try {
    // Build the Places API URL
    const { location = { lat: -33.8688, lng: 151.2093 }, radius = 2000, type = "restaurant", query, pageToken } = params;

    // Create query parameters
    const queryParams: Record<string, string> = {
      location: `${location.lat},${location.lng}`,
      radius: radius.toString(),
      type: type
    };
    
    if (query) {
      queryParams.keyword = query;
    }
    
    if (pageToken) {
      queryParams.pagetoken = pageToken;
    }
    
    const url = buildPlacesApiUrl('nearbysearch', queryParams);

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

    // Filter to only include food-related places
    const filteredResults = data.results ? filterFoodVenues(data.results) : [];
    
    // Convert to venue objects
    const venues = filteredResults.map(convertPlaceToVenue);

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
};
