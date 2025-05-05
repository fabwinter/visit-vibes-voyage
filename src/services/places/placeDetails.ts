
import { toast } from "sonner";
import { buildPlacesApiUrl, convertPlaceToVenue } from "./utils";
import { Venue } from "@/types";

export const getVenueDetails = async (placeId: string): Promise<Venue | null> => {
  try {
    // Create query parameters
    const queryParams: Record<string, string> = {
      place_id: placeId,
      fields: "name,formatted_address,formatted_phone_number,website,opening_hours,photos,price_level,rating,types,geometry"
    };
    
    const url = buildPlacesApiUrl('details', queryParams);
    
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
    return convertPlaceToVenue(place);
  } catch (error) {
    console.error("Error fetching venue details:", error);
    toast("Failed to fetch venue details", {
      description: error instanceof Error ? error.message : "Unknown error occurred"
    });
    return null;
  }
};
