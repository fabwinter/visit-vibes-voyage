
// This file is kept for backwards compatibility
// Import and re-export from the new modular services
import { searchNearbyVenues } from "./places/nearbySearch";
import { searchPlaces } from "./places/placeSearch";
import { getVenueDetails } from "./places/placeDetails";
import { generatePhotoURL } from "./places/utils";
import { PlacesSearchParams } from "./places/types";

// Re-export all functionality
export const PlacesService = {
  searchNearbyVenues,
  searchPlaces,
  getVenueDetails,
  generatePhotoURL
};

// Re-export types
export type { PlacesSearchParams };
