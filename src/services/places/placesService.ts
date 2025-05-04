
import { API_KEY, FOOD_PLACE_TYPES, SEARCH_RADIUS, PROXY_URL } from './config';
import { Venue } from '@/types';

interface NearbySearchParams {
  location: { lat: number; lng: number };
  radius: number;
  types: string[];
  pageToken: string | null;
}

interface NearbySearchResponse {
  results: google.maps.places.PlaceResult[];
  next_page_token?: string;
}

// Function to search for nearby venues
export async function nearbySearch(params: NearbySearchParams): Promise<NearbySearchResponse> {
  try {
    // Use the proxy to avoid CORS issues
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${params.location.lat},${params.location.lng}&radius=${params.radius}&type=restaurant&key=${API_KEY}`;
    
    // Use the page token if available
    const urlWithToken = params.pageToken 
      ? `${apiUrl}&pagetoken=${params.pageToken}`
      : apiUrl;
    
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(urlWithToken)}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error_message) {
      console.error('Google Places API Error:', data.error_message);
      throw new Error(data.error_message);
    }
    
    return {
      results: data.results || [],
      next_page_token: data.next_page_token
    };
    
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw error;
  }
}

// Mock data for testing
export const getMockData = () => {
  return {
    results: [],
    next_page_token: null
  };
};
