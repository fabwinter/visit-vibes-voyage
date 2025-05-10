
import { API_KEY, PROXY_URL } from "./config";
import { Venue } from "@/types";

// Build URL for different Places API endpoints
export const buildPlacesApiUrl = (endpoint: string, params: Record<string, string>): string => {
  let baseUrl: string;
  
  switch (endpoint) {
    case 'nearbysearch':
      baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
      break;
    case 'details':
      baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
      break;
    case 'autocomplete':
      baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
      break;
    case 'textsearch':
      baseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
      break;
    default:
      throw new Error(`Unknown Places API endpoint: ${endpoint}`);
  }

  // Add API key to params
  const allParams = { ...params, key: API_KEY };
  
  // Build query string
  const queryString = Object.entries(allParams)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  // Return full URL with proxy
  return `${PROXY_URL}${encodeURIComponent(`${baseUrl}?${queryString}`)}`;
};

// Generate photo URL from photo reference
export const generatePhotoURL = (photoReference: string, maxWidth: number = 400): string => {
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${API_KEY}`;
  return `${PROXY_URL}${encodeURIComponent(photoUrl)}`;
};

// Convert Google Places API place to our Venue format
export const convertPlaceToVenue = (place: any): Venue => {
  // Extract photos if available
  const photos = place.photos
    ? place.photos.map((photo: any) => generatePhotoURL(photo.photo_reference))
    : [];
  
  // Extract categories from types
  const category = place.types
    ? place.types
        .filter((type: string) => type !== 'point_of_interest' && type !== 'establishment')
        .map((type: string) => {
          // Convert snake_case to Title Case
          return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        })
    : [];
  
  // Extract opening hours
  const hours = place.opening_hours
    ? place.opening_hours.open_now
      ? 'Currently open'
      : 'Currently closed'
    : undefined;
  
  // Build venue object
  return {
    id: place.place_id,
    name: place.name,
    address: place.formatted_address || place.vicinity,
    coordinates: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    },
    photos,
    hours,
    phoneNumber: place.formatted_phone_number,
    website: place.website,
    priceLevel: place.price_level,
    category,
    googleRating: place.rating,
  };
};
