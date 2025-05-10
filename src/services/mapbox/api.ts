
import { MAPBOX_TOKEN } from '../places/config';
import { Venue } from '@/types';
import { toast } from 'sonner';

// Mapbox Geocoding API
const GEOCODING_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

// Mapbox Places API
export const searchPlacesByQuery = async (query: string, location: { lat: number; lng: number }): Promise<Venue[]> => {
  try {
    // Build the URL with proximity for better local results
    const url = `${GEOCODING_API_URL}/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&proximity=${location.lng},${location.lat}&types=poi&limit=10`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform results to our Venue format
    const venues: Venue[] = data.features.map((feature: any) => {
      // Extract the relevant information
      const id = feature.id;
      const name = feature.text;
      const address = feature.place_name.replace(`${name}, `, '');
      const coordinates = {
        lng: feature.center[0],
        lat: feature.center[1]
      };
      
      // Extract categories if available
      const category = feature.properties?.category ? 
        [feature.properties.category.split(',')[0]] : 
        ['Place'];
        
      return {
        id,
        name,
        address,
        coordinates,
        category,
        photos: []
      };
    });
    
    return venues;
  } catch (error) {
    console.error("Error searching places:", error);
    toast.error("Failed to search places");
    return [];
  }
};

// Search for venues nearby a location
export const searchNearbyVenues = async (
  location: { lat: number; lng: number },
  radius: number = 1000
): Promise<Venue[]> => {
  try {
    // Use the geocoding API with a category filter
    const url = `${GEOCODING_API_URL}/${location.lng},${location.lat}.json?access_token=${MAPBOX_TOKEN}&types=poi&limit=15`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter to likely food venues and transform to our Venue format
    const venues: Venue[] = data.features
      .filter((feature: any) => {
        // If we have category info, filter food-related businesses
        if (feature.properties?.category) {
          const category = feature.properties.category.toLowerCase();
          return category.includes('food') || 
                category.includes('restaurant') || 
                category.includes('cafe') ||
                category.includes('bar');
        }
        return true; // Include if we can't determine category
      })
      .map((feature: any) => {
        // Extract the relevant information
        const id = feature.id;
        const name = feature.text;
        const address = feature.place_name.replace(`${name}, `, '');
        const coordinates = {
          lng: feature.center[0],
          lat: feature.center[1]
        };
        
        // Extract categories if available
        const category = feature.properties?.category ? 
          [feature.properties.category.split(',')[0]] : 
          ['Place'];
        
        // Create thumbnail URL using Mapbox Static Images API
        const photoUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${coordinates.lng},${coordinates.lat},15,0/300x200?access_token=${MAPBOX_TOKEN}`;
        
        return {
          id,
          name,
          address,
          coordinates,
          category,
          photos: [photoUrl]
        };
      });
    
    return venues;
  } catch (error) {
    console.error("Error searching nearby venues:", error);
    toast.error("Failed to find nearby venues");
    return [];
  }
};

// Get place details by ID
export const getPlaceDetails = async (placeId: string): Promise<Venue | null> => {
  try {
    // Since Mapbox doesn't have a direct equivalent to Google's place details,
    // we'll get the coordinates and use reverse geocoding
    
    // Extract coordinates from the placeId (Mapbox IDs often have the format 'poi.123456789' or similar)
    // This is a simplified approach - in a real app you might want to store the coordinates with the ID
    const parts = placeId.split('.');
    if (parts.length !== 2) {
      // If the ID doesn't contain coordinates, we'll fetch from storage
      // For example, from visits data or local storage
      const storedVenues = localStorage.getItem('venues');
      if (storedVenues) {
        const venues = JSON.parse(storedVenues);
        const venue = venues.find((v: Venue) => v.id === placeId);
        if (venue) return venue;
      }
      
      throw new Error("Invalid place ID format");
    }
    
    // Use reverse geocoding to get details
    const url = `${GEOCODING_API_URL}/${placeId}.json?access_token=${MAPBOX_TOKEN}&types=poi`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error("No details found for this place ID");
    }
    
    const feature = data.features[0];
    
    // Create a venue object from the feature
    const venue: Venue = {
      id: placeId,
      name: feature.text || "Unknown Venue",
      address: feature.place_name || "Address unavailable",
      coordinates: {
        lng: feature.center[0],
        lat: feature.center[1]
      },
      category: feature.properties?.category ? 
        [feature.properties.category.split(',')[0]] : 
        ['Place'],
      photos: []
    };
    
    // Add a static map image as a photo
    venue.photos = [`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${venue.coordinates.lng},${venue.coordinates.lat},15,0/300x200?access_token=${MAPBOX_TOKEN}`];
    
    return venue;
  } catch (error) {
    console.error("Error fetching place details:", error);
    toast.error("Failed to fetch venue details");
    return null;
  }
};

// Generate static image for a venue
export const generateVenueImage = (coordinates: { lng: number; lat: number }): string => {
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${coordinates.lng},${coordinates.lat},15,0/300x200?access_token=${MAPBOX_TOKEN}`;
};

// Forward geocoding (address to coordinates)
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const url = `${GEOCODING_API_URL}/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error("No results found for this address");
    }
    
    const feature = data.features[0];
    
    return {
      lat: feature.center[1],
      lng: feature.center[0]
    };
  } catch (error) {
    console.error("Error geocoding address:", error);
    toast.error("Failed to geocode address");
    return null;
  }
};

// Reverse geocoding (coordinates to address)
export const reverseGeocode = async (coordinates: { lat: number; lng: number }): Promise<string | null> => {
  try {
    const url = `${GEOCODING_API_URL}/${coordinates.lng},${coordinates.lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error("No results found for these coordinates");
    }
    
    return data.features[0].place_name;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    toast.error("Failed to get address for location");
    return null;
  }
};
