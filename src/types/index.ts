
// Base types for the VisitVibe app

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  photos: string[];
  website?: string;
  hours?: string;
  phoneNumber?: string;
  priceLevel?: number; // 1-4 representing $ to $$$$
  category?: string[];
  lastVisit?: Visit; // Added lastVisit for quick access to latest visit data
  googleRating?: number; // Added for Google rating
  inWishlist?: boolean; // Track wishlist status
  wishlistTags?: string[]; // Tags specific to wishlist
  wishlistCategory?: string; // Category in wishlist
}

export interface DishRating {
  id: string;
  name: string;
  photo?: string;
  price?: number;
  rating: number; // 1-5
  tags: string[];
  notes?: string;
  type: "dish" | "drink"; // Added type to distinguish between dishes and drinks
}

export interface VisitRating {
  food: number; // 1-5
  ambiance: number; // 1-5
  service: number; // 1-5
  value: number; // 1-5
  overall: number; // Calculated weighted average
}

export interface Visit {
  id: string;
  venueId: string;
  timestamp: string; // ISO date string
  rating: VisitRating;
  dishes: DishRating[];
  photos: string[];
  notes?: string;
  tags: string[];
  wouldVisitAgain?: boolean;
  totalBill?: number; // Added total bill amount
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
