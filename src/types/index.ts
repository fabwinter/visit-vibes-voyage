// Base types for the VisitVibe app

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  photos: string[];
  lastVisit?: Visit; // Optional reference to last visit
  category?: string[];
  distance?: number; // Add distance property for Foursquare API
  website?: string;
  hours?: string;
  phoneNumber?: string;
  priceLevel?: number;
  googleRating?: number;
  inWishlist?: boolean; // Track wishlist status
  wishlistTags?: string[]; // Tags specific to wishlist
  wishlistCategory?: string; // Category in wishlist
}

export interface DishRating {
  id: string;
  name: string;
  type: 'dish' | 'drink';
  rating: number;
  tags: string[];
  price?: number;
  quantity?: number;
  photos?: string[];
}

export interface VisitRating {
  food: number;
  service: number;
  ambiance: number;
  value: number;
  overall: number;
  facilities?: number;
  cleanliness?: number;
}

export interface Visit {
  id: string;
  venueId: string;
  timestamp: string; // ISO date string
  dishes: DishRating[];
  rating: VisitRating;
  photos: string[];
  notes?: string;
  tags: string[];
  wouldVisitAgain?: boolean;
  totalBill?: number; // Added total bill amount
  isTakeaway?: boolean;
}

export type RatingLevel = "good" | "mid" | "bad";

export const getRatingLevel = (rating: number): RatingLevel => {
  if (rating >= 4) return "good";
  if (rating >= 3) return "mid";
  return "bad";
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  visits: Visit[];
  savedVenues: Venue[];
  tags: string[]; // User's custom tags
  wishlistCategories: string[]; // Added wishlist categories
  // New fields for profile customization
  displayName?: string;
  bio?: string;
  preferences?: {
    darkMode?: boolean;
    notificationsEnabled?: boolean;
    privacySettings?: {
      shareVisits?: boolean;
      shareLocation?: boolean;
    }
  };
}

// New interface for wishlist
export interface WishlistItem {
  venueId: string;
  addedAt: string; // ISO date string
  category?: string;
  tags: string[];
  notes?: string;
  priority?: "high" | "medium" | "low";
}
