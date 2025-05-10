
import { Venue } from "@/types";

// Generate photo URL from Foursquare photo prefix and suffix
export const generatePhotoURL = (photoPrefix: string, photoSuffix: string, size: string = 'original'): string => {
  return `${photoPrefix}${size}${photoSuffix}`;
};

// Convert Foursquare venue to our app's Venue format
export const convertPlaceToVenue = (place: any): Venue => {
  // Extract photos if available
  const photos = place.photos && place.photos.length > 0
    ? place.photos.map((photo: any) => generatePhotoURL(photo.prefix, photo.suffix))
    : [];
  
  // Build venue object
  return {
    id: place.fsq_id,
    name: place.name,
    address: place.location.formatted_address,
    coordinates: {
      lat: place.geocodes.main.latitude,
      lng: place.geocodes.main.longitude,
    },
    photos,
    hours: place.hours?.display,
    phoneNumber: place.tel,
    website: place.website,
    priceLevel: place.price?.tier,
    category: place.categories?.map((cat: any) => cat.name) || [],
    googleRating: place.rating,
  };
};

// Build API URL for Foursquare endpoints (not used in frontend, only in edge functions)
export const buildPlacesApiUrl = (endpoint: string, params: Record<string, string>): string => {
  // This is now handled by edge functions
  return '';
};
