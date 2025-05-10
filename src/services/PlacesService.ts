
// This file is kept for backwards compatibility
// Import and re-export from the Mapbox service
import { MapboxService } from "./mapbox";
import { Venue } from "@/types";

// Re-export the MapboxService as PlacesService
export const PlacesService = {
  searchNearbyVenues: async (params: any) => {
    const venues = await MapboxService.searchNearbyVenues(params.location, params.radius);
    return { venues, nextPageToken: undefined };
  },
  
  searchPlaces: async (query: string, location: { lat: number; lng: number }) => {
    return await MapboxService.searchPlacesByQuery(query, location);
  },
  
  getVenueDetails: async (placeId: string) => {
    return await MapboxService.getPlaceDetails(placeId);
  },
  
  generatePhotoURL: (reference: string) => {
    // This is a placeholder for backward compatibility
    // It will return the reference as-is since it's already a URL in our new implementation
    return reference;
  }
};

// Define types for backward compatibility
export type PlacesSearchParams = {
  location: { lat: number; lng: number };
  radius?: number;
  type?: string;
  pageToken?: string;
};
