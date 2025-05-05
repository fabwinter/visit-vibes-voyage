
import { Venue } from "@/types";

export interface PlacesSearchParams {
  query?: string;
  location?: { lat: number; lng: number };
  radius?: number;
  type?: string;
  pageToken?: string;
}

export interface PlacesSearchResponse {
  venues: Venue[];
  nextPageToken?: string;
}

export interface GooglePlaceDetails {
  rating?: number;
  user_ratings_total?: number;
  reviews?: GoogleReview[];
  price_level?: number;
  open_now?: boolean;
}

export interface GoogleReview {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}
