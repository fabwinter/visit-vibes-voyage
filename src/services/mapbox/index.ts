
import { Venue } from '@/types';
import { MAPBOX_TOKEN } from '../places/config';
import { PlacesSearchParams, PlacesSearchResponse } from '../places/types';
import { toast } from 'sonner';
import { mockVenues } from '@/data/mockData';

// Main service object
export const MapboxService = {
  searchNearbyVenues,
  searchPlaces,
  getVenueDetails,
  generatePhotoURL,
  reverseGeocode
};

// Search nearby venues using Mapbox API
export async function searchNearbyVenues(params: PlacesSearchParams): Promise<PlacesSearchResponse> {
  try {
    console.log("Searching for nearby venues with Mapbox:", params);
    
    if (!params.location) {
      throw new Error("Location is required for nearby search");
    }
    
    // Build Mapbox API URL for POI (point of interest) search
    const endpoint = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
    
    // Create query for restaurants, cafes, etc.
    let query = "restaurant";
    if (params.type) {
      query = params.type;
    }
    
    const { lat, lng } = params.location;
    const radius = params.radius || 5000; // Default 5km radius
    const radiusInKm = radius / 1000;
    
    // Format the endpoint URL
    const url = `${endpoint}${encodeURIComponent(query)}.json?` + 
      `proximity=${lng},${lat}` + 
      `&radius=${radiusInKm}` +
      `&types=poi` +
      `&limit=25` +
      `&access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.log("No venues found in Mapbox response");
      throw new Error("No venues found");
    }
    
    // Transform Mapbox features to our Venue format
    const venues: Venue[] = data.features.map((feature: any) => {
      // Extract coordinates
      const [lng, lat] = feature.center;
      
      // Extract categories if available
      const categories = feature.properties?.category?.split(',') || [];
      
      return {
        id: feature.id,
        name: feature.text,
        address: feature.place_name,
        coordinates: { lat, lng },
        photos: [], // Mapbox doesn't provide photos in this API
        category: categories.length > 0 ? categories : ["restaurant"]
        // Removed mapboxId property
      };
    });
    
    return { venues, nextPageToken: undefined };
    
  } catch (error) {
    console.error("Error searching nearby venues with Mapbox:", error);
    toast.error("Failed to search venues with Mapbox, using mock data");
    
    // Return mock data as fallback
    return {
      venues: mockVenues,
      nextPageToken: undefined
    };
  }
}

// Search places by query
export async function searchPlaces(query: string, location: { lat: number; lng: number }): Promise<Venue[]> {
  try {
    console.log("Searching places with Mapbox:", query, location);
    
    // Build Mapbox API URL for geocoding (search)
    const endpoint = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
    const url = `${endpoint}${encodeURIComponent(query)}.json?` +
      `proximity=${location.lng},${location.lat}` +
      `&types=poi` +
      `&limit=10` +
      `&access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Convert results to our Venue format
    const venues: Venue[] = data.features.map((feature: any) => {
      // Extract coordinates
      const [lng, lat] = feature.center;
      
      // Get categories if available
      const categories = feature.properties?.category?.split(',') || [];
      
      return {
        id: feature.id,
        name: feature.text,
        address: feature.place_name,
        coordinates: { lat, lng },
        photos: [],
        category: categories.length > 0 ? categories : ["restaurant"]
        // Removed mapboxId property
      };
    });
    
    return venues;
    
  } catch (error) {
    console.error("Error searching places with Mapbox:", error);
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
}

// Get venue details by ID
export async function getVenueDetails(placeId: string): Promise<Venue | null> {
  try {
    console.log("Getting venue details for:", placeId);
    
    // First check if we have this venue in mock data
    const mockVenue = mockVenues.find(venue => venue.id === placeId);
    
    if (mockVenue) {
      console.log("Found venue in mock data:", mockVenue);
      return mockVenue;
    }
    
    // If the ID is a Mapbox ID, fetch the feature
    if (placeId.startsWith('poi.')) {
      // Get feature from Mapbox
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${placeId}.json?` +
        `access_token=${MAPBOX_TOKEN}`;
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Mapbox API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        throw new Error("No venue details found");
      }
      
      const feature = data.features[0];
      const [lng, lat] = feature.center;
      
      // Convert to our Venue format
      const venue: Venue = {
        id: feature.id,
        name: feature.text,
        address: feature.place_name,
        coordinates: { lat, lng },
        photos: [],
        category: feature.properties?.category?.split(',') || ["restaurant"]
        // Removed mapboxId property
      };
      
      return venue;
    }
    
    // For Google Places IDs, we'll generate a mock venue as fallback
    // This will be replaced with proper Mapbox integration later
    const fallbackVenue: Venue = {
      id: placeId,
      name: "Venue " + placeId.substring(0, 5),
      address: "Address unavailable - using mock data",
      coordinates: { lat: -33.8688, lng: 151.2093 },
      photos: [],
      category: ["restaurant"]
    };
    
    return fallbackVenue;
    
  } catch (error) {
    console.error("Error fetching venue details:", error);
    toast("Failed to fetch venue details", {
      description: error instanceof Error ? error.message : "Unknown error occurred"
    });
    
    // Generate a mock venue as fallback
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
}

// Generate photo URL (placeholder for now since Mapbox doesn't provide venue photos)
export function generatePhotoURL(reference: string): string {
  // Return a placeholder image since Mapbox doesn't have photo references
  return `https://via.placeholder.com/400x300?text=No+Photo+Available`;
}

// Add reverse geocoding functionality
export async function reverseGeocode(coordinates: { lat: number; lng: number }): Promise<string> {
  try {
    const { lng, lat } = coordinates;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
      `access_token=${MAPBOX_TOKEN}`;
      
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    
    return "Unknown location";
    
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return "Location unavailable";
  }
}

// Export types
export type { PlacesSearchParams, PlacesSearchResponse };
