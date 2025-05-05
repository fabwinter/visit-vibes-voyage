
import { toast } from "sonner";
import { buildPlacesApiUrl, convertPlaceToVenue } from "./utils";
import { Venue } from "@/types";
import { mockVenues } from "@/data/mockData";

export const getVenueDetails = async (placeId: string): Promise<Venue | null> => {
  try {
    console.log("Getting venue details for:", placeId);
    
    // First check if we have this venue in mock data
    const mockVenue = mockVenues.find(venue => venue.id === placeId);
    
    if (mockVenue) {
      console.log("Found venue in mock data:", mockVenue);
      return mockVenue;
    }
    
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
      if (data.status === "REQUEST_DENIED" || data.error_message) {
        console.error("Google Places API error:", data.error_message || data.status);
        throw new Error(`Google Places API error: ${data.error_message || data.status}`);
      }
      
      // Generate a mock venue since API failed
      const fallbackVenue: Venue = {
        id: placeId,
        name: "Venue " + placeId.substring(0, 5),
        address: "API Error - Using Mock Data",
        coordinates: { lat: -33.8688, lng: 151.2093 },
        photos: [],
        category: ["restaurant"]
      };
      
      return fallbackVenue;
    }

    const place = data.result;
    return convertPlaceToVenue(place);
  } catch (error) {
    console.error("Error fetching venue details:", error);
    toast("Failed to fetch venue details", {
      description: error instanceof Error ? error.message : "Unknown error occurred"
    });
    
    // Generate a mock venue since API failed
    const fallbackVenue: Venue = {
      id: placeId,
      name: "Venue " + placeId.substring(0, 5),
      address: "API Error - Using Mock Data",
      coordinates: { lat: -33.8688, lng: 151.2093 },
      photos: [],
      category: ["restaurant"]
    };
    
    return fallbackVenue;
  }
};
