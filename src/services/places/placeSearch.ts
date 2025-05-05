
import { toast } from "sonner";
import { buildPlacesApiUrl } from "./utils";
import { Venue } from "@/types";
import { mockVenues } from "@/data/mockData";

export const searchPlaces = async (query: string, location: { lat: number; lng: number }): Promise<Venue[]> => {
  try {
    console.log("Searching places with query:", query, "near:", location);
    
    // Create query parameters
    const queryParams: Record<string, string> = {
      input: query,
      location: `${location.lat},${location.lng}`,
      radius: "50000",
      types: "establishment",
      strictbounds: "true"
    };
    
    const url = buildPlacesApiUrl('autocomplete', queryParams);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    // Process autocomplete predictions
    const predictions = data.predictions || [];
    
    // Convert predictions to a simplified venue format for display in autocomplete
    const venues: Venue[] = predictions.map((prediction: any) => ({
      id: prediction.place_id,
      name: prediction.structured_formatting.main_text,
      address: prediction.structured_formatting.secondary_text || prediction.description,
      coordinates: { lat: 0, lng: 0 }, // Will be populated after selection
      category: [],
      photos: []
    }));
    
    return venues;
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
