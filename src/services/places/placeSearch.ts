
import { toast } from "sonner";
import { SUPABASE_URL } from "./config";
import { Venue } from "@/types";
import { mockVenues } from "@/data/mockData";

export const searchPlaces = async (query: string, location: { lat: number; lng: number }): Promise<Venue[]> => {
  try {
    console.log("Searching places with query:", query, "near:", location);
    
    // Create query parameters for the edge function
    const queryParams = new URLSearchParams({
      query,
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      limit: "10"
    });
    
    // Make request to our edge function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/venues-search?${queryParams.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Edge function error:", response.status, errorText);
      throw new Error(`Failed to search places: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return venues from the response
    return data.venues || [];
  } catch (error) {
    console.error("Error searching places:", error);
    toast.error("Search failed, showing suggestions from mock data");
    
    // Filter mock venues that match the query in some way
    const filteredMockVenues = mockVenues.filter(venue => 
      venue.name.toLowerCase().includes(query.toLowerCase()) || 
      venue.address.toLowerCase().includes(query.toLowerCase()) ||
      (venue.category && venue.category.some(cat => 
        cat.toLowerCase().includes(query.toLowerCase())
      ))
    );
    
    return filteredMockVenues.length > 0 ? filteredMockVenues : [];
  }
};
