
import { searchNearbyVenues } from "./nearbySearch";
import { searchPlaces } from "./placeSearch";
import { getVenueDetails } from "./placeDetails";
import { generatePhotoURL } from "./utils";
import { PlacesSearchParams } from "./types";

// Re-export all functionality
export const PlacesService = {
  searchNearbyVenues,
  searchPlaces,
  getVenueDetails,
  generatePhotoURL
};

// Re-export types
export type { PlacesSearchParams };
