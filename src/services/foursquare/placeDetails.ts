
import { toast } from "sonner";
import { FOURSQUARE_API_URL, PROXY_URL, getDefaultHeaders } from "./config";
import { FoursquareVenueDetailsResponse } from "./types";
import { Venue } from "@/types";
import { convertFoursquareDetailsToVenue } from "./utils";

// Get venue details by place ID
export const getVenueDetails = async (placeId: string): Promise<Venue | null> => {
  try {
    console.log("Getting venue details for:", placeId);
    
    // Build the URL for place details
    const url = `${PROXY_URL}${encodeURIComponent(`${FOURSQUARE_API_URL}/places/${placeId}?fields=fsq_id,name,categories,location,geocodes,website,tel,hours,rating,stats,price,photos,tips,tastes,features`)}`;
    
    console.log("Fetching details from URL:", url);
    
    // Make the API call
    const response = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders()
    });
    
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
    toast.error("Failed to fetch venue details", {
      description: error instanceof Error ? error.message : "Unknown error occurred"
    });
    
    // Return null when there's an error
    return null;
  }
};
