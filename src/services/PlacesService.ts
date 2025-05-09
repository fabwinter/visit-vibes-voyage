
// This file is kept for backwards compatibility
// Import and re-export from the new Foursquare services
import { FoursquareService, NearbySearchResponse } from "./foursquare";

// Re-export everything from the Foursquare services
export const PlacesService = {
  searchNearbyVenues: FoursquareService.searchNearbyVenues,
  searchPlaces: FoursquareService.searchPlaces,
  getVenueDetails: FoursquareService.getVenueDetails,
  generatePhotoURL: (photoRef: string) => photoRef // Pass-through for backwards compatibility
};

// Re-export types
export type { NearbySearchResponse as PlacesSearchResponse };
export interface PlacesSearchParams {
  location: { lat: number; lng: number };
  radius?: number;
  type?: string;
  pageToken?: string;
}
