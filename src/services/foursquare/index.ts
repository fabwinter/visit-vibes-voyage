
import { searchNearbyVenues, NearbySearchResponse } from "./nearbySearch";
import { searchPlaces } from "./placeSearch";
import { getVenueDetails } from "./placeDetails";
import { generatePhotoUrls } from "./utils";

// Export all Foursquare functionality
export const FoursquareService = {
  searchNearbyVenues,
  searchPlaces,
  getVenueDetails,
  generatePhotoUrls
};

// Re-export types
export type { NearbySearchResponse };
