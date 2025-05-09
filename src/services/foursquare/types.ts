
import { Venue } from "@/types";

// Types for Foursquare API requests and responses
export interface FoursquareSearchParams {
  query?: string;
  ll?: string; // "latitude,longitude"
  radius?: number;
  categories?: string;
  limit?: number;
  sort?: "RELEVANCE" | "RATING" | "DISTANCE";
}

export interface FoursquarePlace {
  fsq_id: string;
  categories: FoursquareCategory[];
  chains: any[];
  distance?: number;
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    };
    roof?: {
      latitude: number;
      longitude: number;
    };
  };
  link?: string;
  location: {
    address?: string;
    country?: string;
    cross_street?: string;
    formatted_address?: string;
    locality?: string;
    postcode?: string;
    region?: string;
  };
  name: string;
  related_places?: any;
  timezone?: string;
}

export interface FoursquareCategory {
  id: number;
  name: string;
  short_name?: string;
  icon?: {
    prefix: string;
    suffix: string;
  };
}

export interface FoursquareResponse {
  results: FoursquarePlace[];
  context?: {
    geo_bounds?: {
      circle?: {
        center?: {
          latitude?: number;
          longitude?: number;
        };
        radius?: number;
      };
    };
  };
}

export interface FoursquareVenueDetailsResponse extends FoursquarePlace {
  description?: string;
  tel?: string;
  website?: string;
  hours?: {
    display?: string;
    is_local_holiday?: boolean;
    open_now?: boolean;
    regular?: {
      day: number;
      open: string;
      close: string;
    }[];
  };
  popular?: {
    day: number;
    hour: number;
    ranking: number;
  }[];
  rating?: number;
  stats?: {
    total_photos?: number;
    total_ratings?: number;
    total_tips?: number;
  };
  price?: number; // 1-4 representing $ to $$$$
  photos?: FoursquarePhoto[];
  tips?: {
    id: string;
    created_at: string;
    text: string;
    url: string;
  }[];
  tastes?: string[];
  features?: {
    payment?: string[];
    food_and_drink?: string[];
    services?: string[];
    amenities?: string[];
  };
}

export interface FoursquarePhoto {
  id: string;
  created_at: string;
  prefix: string;
  suffix: string;
  width: number;
  height: number;
}

export interface FoursquareSearchResponse {
  venues: Venue[];
  context?: any;
}

export interface FoursquareAutocompleteParams {
  query: string;
  ll?: string; // "latitude,longitude"
  radius?: number;
  types?: "place";
  limit?: number;
}

export interface FoursquareAutocompleteResponse {
  results: {
    fsq_id: string;
    text: {
      primary: string;
      secondary?: string;
      highlight?: any[];
    };
    icon?: {
      prefix: string;
      suffix: string;
    };
    type: string;
    link?: string;
    distance?: number;
  }[];
}
