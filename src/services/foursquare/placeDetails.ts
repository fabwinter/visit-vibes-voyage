
import { toast } from "sonner";
import { FOURSQUARE_API_URL, PROXY_URL, getDefaultHeaders } from "./config";
import { FoursquareVenueDetailsResponse } from "./types";
import { Venue } from "@/types";
import { convertFoursquareDetailsToVenue } from "./utils";
import { mockVenues } from "@/data/mockData";

// Get venue details by place ID
export const getVenueDetails = async (placeId: string): Promise<Venue | null> => {
  try {
    console.log("Getting venue details for:", placeId);
    
    // Check if we already have this venue in mock data
    const mockVenue = mockVenues.find(venue => venue.id === placeId);
    if (mockVenue) {
      console.log("Found venue in mock data:", mockVenue);
      return mockVenue;
    }
    
    // Build the URL for place details
    const url = `${PROXY_URL}${encodeURIComponent(`${FOURSQUARE_API_URL}/places/${placeId}?fields=fsq_id,name,categories,location,geocodes,website,tel,hours,rating,stats,price,photos,tips,tastes,features`)}`;
    
    console.log("Fetching details from URL:", url);
    
    // Make the API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Make the API call
    const response = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is ok
    if (!response.ok) {
      console.error("API request failed with status:", response.status);
      console.error("Response text:", await response.text());
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const details: FoursquareVenueDetailsResponse = await response.json();
    console.log("Venue details received:", details);
    
    // Convert to our app's Venue type
    const venue = convertFoursquareDetailsToVenue(details);
    console.log("Converted venue:", venue);
    return venue;
  } catch (error) {
    console.error("Error fetching venue details:", error);
    
    // Try finding in mock data as fallback
    const mockVenue = mockVenues.find(venue => venue.id === placeId);
    if (mockVenue) {
      console.log("Found venue in mock data after API failure:", mockVenue);
      toast.info("Using cached venue data");
      return mockVenue;
    }
    
    toast.error("Failed to fetch venue details", {
      description: error instanceof Error ? error.message : "Unknown error occurred"
    });
    
    // Return null when there's an error
    return null;
  }
};
