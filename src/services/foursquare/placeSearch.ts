
import { toast } from "sonner";
import { FOURSQUARE_API_URL, PROXY_URL, getDefaultHeaders } from "./config";
import { FoursquareAutocompleteParams, FoursquareAutocompleteResponse } from "./types";
import { Venue } from "@/types";
import { mockVenues } from "@/data/mockData";

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
    const url = `${PROXY_URL}${FOURSQUARE_API_URL}/autocomplete?${queryString}`;
    
    console.log("Fetching from URL:", url);
    
    // Make the API call with timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
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
    
    const data: FoursquareAutocompleteResponse = await response.json();
    console.log("Autocomplete response received:", data);
    
    // Process autocomplete results
    if (!data.results || data.results.length === 0) {
      console.log("No results found for query:", query);
      return [];
    }
    
    const venues: Venue[] = data.results
      .filter(result => result.fsq_id) // Filter out results without an ID
      .map((result) => ({
        id: result.fsq_id,
        name: result.text.primary,
        address: result.text.secondary || '',
        coordinates: { lat: 0, lng: 0 }, // Will be populated after selection
        photos: [],
        category: [],
        distance: result.distance
      }));
    
    console.log("Processed venues:", venues);
    return venues;
  } catch (error) {
    console.error("Error searching places:", error);
    
    // Use mock data as fallback
    console.log("Using mock data as fallback");
    const filteredMockVenues = mockVenues.filter(venue => 
      venue.name.toLowerCase().includes(query.toLowerCase()) || 
      (venue.address && venue.address.toLowerCase().includes(query.toLowerCase())) ||
      (venue.category && venue.category.some(cat => 
        cat.toLowerCase().includes(query.toLowerCase())
      ))
    );
    
    // Only show toast if this isn't an abort error (timeout)
    if (!(error instanceof DOMException && error.name === 'AbortError')) {
      toast.error("Search using API failed, showing local results instead");
    }
    
    return filteredMockVenues.length > 0 ? filteredMockVenues.slice(0, 5) : [];
  }
};
