
// This file is kept for backwards compatibility
// Import and re-export from the new modular services
import { PlacesService as ModularPlacesService, PlacesSearchParams } from "./places";

// Re-export everything from the modular services
export const PlacesService = ModularPlacesService;

// Re-export types
export type { PlacesSearchParams };
