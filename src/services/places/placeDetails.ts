
import { toast } from "sonner";
import { SUPABASE_URL } from "./config";
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
    
    // Create query parameters for the edge function
    const queryParams = new URLSearchParams({
      id: placeId
    });
    
    // Make request to our edge function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/venue-details?${queryParams.toString()}`);
    
    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Edge function error:", response.status, errorText);
      throw new Error(`Failed to get venue details: ${response.status}`);
    }
    
    // The edge function already transforms the venue data to our format
    const venue = await response.json();
    return venue;
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
