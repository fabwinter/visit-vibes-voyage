
import { toast } from "sonner";
import { FOURSQUARE_API_URL, PROXY_URL, getDefaultHeaders } from "./config";
import { FoursquareAutocompleteParams, FoursquareAutocompleteResponse } from "./types";
import { Venue } from "@/types";

// Search places by query string using Foursquare autocomplete API
export const searchPlaces = async (query: string, location: { lat: number; lng: number }): Promise<Venue[]> => {
  try {
    console.log("Searching places with query:", query, "near:", location);
    
    // Create query parameters
    const params: FoursquareAutocompleteParams = {
      query,
      ll: `${location.lat},${location.lng}`,
      radius: 50000,
      types: "place",
      limit: 10
    };
    
    // Build the URL with query parameters
    const queryString = new URLSearchParams(params as any).toString();
    const url = `${PROXY_URL}${encodeURIComponent(`${FOURSQUARE_API_URL}/autocomplete?${queryString}`)}`;
    
    console.log("Fetching from URL:", url);
    
    // Make the API call
    const response = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders()
    });
    
    if (!response.ok) {
      console.error("API request failed with status:", response.status);
      console.error("Response text:", await response.text());
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data: FoursquareAutocompleteResponse = await response.json();
    console.log("Autocomplete response received:", data);
    
    // Process autocomplete results
    const venues: Venue[] = data.results
      .filter(result => result.fsq_id) // Filter out results without an ID
      .map((result) => ({
        id: result.fsq_id,
        name: result.text.primary,
        address: result.text.secondary || '',
        coordinates: { lat: 0, lng: 0 }, // Will be populated after selection
        photos: [],
        category: []
      }));
    
    console.log("Processed venues:", venues);
    return venues;
  } catch (error) {
    console.error("Error searching places:", error);
    toast.error("Search failed. Please try again.");
    return [];
  }
};
