
import { Venue, WishlistItem } from "@/types";
import { toast } from "sonner";

// Local storage key
const WISHLIST_STORAGE_KEY = "visitvibe_wishlist";

// Get wishlist from local storage
export const getWishlist = (): WishlistItem[] => {
  const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
  if (storedWishlist) {
    return JSON.parse(storedWishlist);
  }
  return [];
};

// Add venue to wishlist
export const addToWishlist = (venue: Venue, tags: string[] = [], category?: string): void => {
  const wishlist = getWishlist();
  
  // Check if venue is already in wishlist
  if (wishlist.some(item => item.venueId === venue.id)) {
    toast("This venue is already in your wishlist");
    return;
  }
  
  // Create new wishlist item
  const newItem: WishlistItem = {
    venueId: venue.id,
    addedAt: new Date().toISOString(),
    tags,
    category,
    notes: ""
  };
  
  // Add to wishlist
  wishlist.push(newItem);
  
  // Save to local storage
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  
  toast.success("Added to wishlist");
};

// Remove venue from wishlist
export const removeFromWishlist = (venueId: string): void => {
  let wishlist = getWishlist();
  
  // Filter out the venue
  wishlist = wishlist.filter(item => item.venueId !== venueId);
  
  // Save to local storage
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  
  toast.success("Removed from wishlist");
};

// Update wishlist item
export const updateWishlistItem = (venueId: string, updates: Partial<WishlistItem>): void => {
  let wishlist = getWishlist();
  
  // Find and update the item
  wishlist = wishlist.map(item => {
    if (item.venueId === venueId) {
      return { ...item, ...updates };
    }
    return item;
  });
  
  // Save to local storage
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
};

// Check if venue is in wishlist
export const isInWishlist = (venueId: string): boolean => {
  const wishlist = getWishlist();
  return wishlist.some(item => item.venueId === venueId);
};

// Get wishlist categories
export const getWishlistCategories = (): string[] => {
  const wishlist = getWishlist();
  const categories = wishlist
    .map(item => item.category)
    .filter((category): category is string => !!category);
  
  // Return unique categories
  return Array.from(new Set(categories));
};

// Get wishlist tags
export const getWishlistTags = (): string[] => {
  const wishlist = getWishlist();
  const tags: string[] = [];
  
  wishlist.forEach(item => {
    item.tags.forEach(tag => {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    });
  });
  
  return tags;
};
