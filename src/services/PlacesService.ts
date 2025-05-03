
import { toast } from "sonner";
import { Venue } from "../types";

// Using the provided Google Places API key
const API_KEY = "AIzaSyAoqbocwE83Z3REe60z7dhN3Z2_aKnSJxc"; 

export interface PlacesSearchParams {
  query?: string;
  location?: { lat: number; lng: number };
  radius?: number;
  type?: string;
  pageToken?: string;
}

export const PlacesService = {
  async searchNearbyVenues(params: PlacesSearchParams): Promise<{ venues: Venue[], nextPageToken?: string }> {
    try {
      // Build the Places API URL
      const { location = { lat: -33.8688, lng: 151.2093 }, radius = 2000, type = "restaurant", query } = params;

      let url = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?`;
      url += `location=${location.lat},${location.lng}`;
      url += `&radius=${radius}`;
      url += `&type=${type}`;
      if (query) url += `&keyword=${encodeURIComponent(query)}`;
      if (params.pageToken) url += `&pagetoken=${params.pageToken}`;
      url += `&key=${API_KEY}`;

      console.log("Fetching venues from Google Places API...");
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      // Transform Google Places results into our Venue format
      const venues: Venue[] = data.results ? data.results.map((place: any) => {
        return {
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
          photos: place.photos 
            ? place.photos.map((photo: any) => 
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`
              )
            : [],
          priceLevel: place.price_level,
          category: place.types ? place.types.filter((type: string) => 
            !["point_of_interest", "establishment"].includes(type)
          ) : [],
        };
      }) : [];

      return { 
        venues,
        nextPageToken: data.next_page_token
      };
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast("Failed to fetch venues", { 
        description: error instanceof Error ? error.message : "Unknown error occurred"
        // Removed the 'variant' property which was causing TypeScript errors
      });
      return { venues: [] };
    }
  },

  async getVenueDetails(placeId: string): Promise<Venue | null> {
    try {
      const url = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,price_level,rating,types,geometry&key=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const place = data.result;
      
      return {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        photos: place.photos 
          ? place.photos.map((photo: any) => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${API_KEY}`
            )
          : [],
        website: place.website,
        hours: place.opening_hours?.weekday_text?.join(", "),
        phoneNumber: place.formatted_phone_number,
        priceLevel: place.price_level,
        category: place.types ? place.types.filter((type: string) => 
          !["point_of_interest", "establishment"].includes(type)
        ) : [],
      };
    } catch (error) {
      console.error("Error fetching venue details:", error);
      toast("Failed to fetch venue details", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
        // Removed the 'variant' property which was causing TypeScript errors
      });
      return null;
    }
  },

  generatePhotoURL(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${API_KEY}`;
  }
};
