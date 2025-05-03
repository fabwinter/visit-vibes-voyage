
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
