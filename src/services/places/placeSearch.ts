
import { toast } from "sonner";
import { buildPlacesApiUrl } from "./utils";
import { Venue } from "@/types";
import { API_KEY, PROXY_URL } from "./config";

export const searchPlaces = async (query: string, location: { lat: number; lng: number }): Promise<Venue[]> => {
  try {
    console.log(`Searching for places with query "${query}" near ${location.lat},${location.lng}`);
    
    // Create query parameters
    const queryParams: Record<string, string> = {
      input: query,
      location: `${location.lat},${location.lng}`,
      radius: "50000",
      types: "establishment",
      strictbounds: "true"
    };
    
    // Build the URL
    let apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?`;
    
    // Add all params
    for (const [key, value] of Object.entries(queryParams)) {
      apiUrl += `${key}=${encodeURIComponent(value)}&`;
    }
    
    // Add API key
    apiUrl += `key=${API_KEY}`;
    
    console.log("Making Places API autocomplete request via proxy");
    
    // Make the API call via proxy
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(apiUrl)}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Places Autocomplete API response:", data);
    
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
    toast.error("Failed to search places");
    return [];
  }
};
