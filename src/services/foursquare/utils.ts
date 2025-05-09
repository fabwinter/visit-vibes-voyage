
import { FoursquarePlace, FoursquareVenueDetailsResponse, FoursquarePhoto } from './types';
import { Venue } from '@/types';

// Convert a Foursquare place to our app's Venue type
export const convertFoursquareToVenue = (place: FoursquarePlace): Venue => {
  // Extract category names from Foursquare categories
  const categories = place.categories?.map(category => category.name) || [];

  // Build the venue object
  return {
    id: place.fsq_id,
    name: place.name,
    address: place.location.formatted_address || place.location.address || '',
    coordinates: {
      lat: place.geocodes.main.latitude,
      lng: place.geocodes.main.longitude
    },
    photos: [],
    category: categories,
    distance: place.distance
  };
};

// Convert a detailed Foursquare place to our app's Venue type with more details
export const convertFoursquareDetailsToVenue = (details: FoursquareVenueDetailsResponse): Venue => {
  // Extract category names
  const categories = details.categories?.map(category => category.name) || [];
  
  // Generate photo URLs if available
  const photos = details.photos ? generatePhotoUrls(details.photos) : [];
  
  // Extract hours information if available
  const hours = details.hours?.display || 
                (details.hours?.open_now ? 'Open now' : 'Hours not available');

  return {
    id: details.fsq_id,
    name: details.name,
    address: details.location.formatted_address || details.location.address || '',
    coordinates: {
      lat: details.geocodes.main.latitude,
      lng: details.geocodes.main.longitude
    },
    photos,
    website: details.website,
    hours,
    phoneNumber: details.tel,
    priceLevel: details.price,
    category: categories,
    googleRating: details.rating, // Using Foursquare rating as equivalent
    distance: details.distance
  };
};

// Generate photo URLs from Foursquare photo objects
export const generatePhotoUrls = (photos: FoursquarePhoto[]): string[] => {
  return photos.map(photo => {
    // Format for Foursquare photos is: prefix + size + suffix
    // Using 300x300 size for thumbnails
    return `${photo.prefix}300x300${photo.suffix}`;
  });
};

// Format category IDs for Foursquare API
export const formatCategoryParam = (categoryIds: string[]): string => {
  return categoryIds.join(',');
};
