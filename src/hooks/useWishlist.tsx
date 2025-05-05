
import { useState, useEffect } from 'react';
import { WishlistItem, Venue } from '@/types';
import * as WishlistService from '@/services/wishlistService';

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistVenues, setWishlistVenues] = useState<Venue[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  
  // Load wishlist data from localStorage
  useEffect(() => {
    const loadWishlist = () => {
      const items = WishlistService.getWishlist();
      setWishlistItems(items);
      setCategories(WishlistService.getWishlistCategories());
      setTags(WishlistService.getWishlistTags());
      
      // Load venue details for wishlist items
      const storedVenues = localStorage.getItem('venues');
      if (storedVenues) {
        const venues = JSON.parse(storedVenues) as Venue[];
        const wishlistVenues = items.map(item => {
          const venue = venues.find(v => v.id === item.venueId);
          if (venue) {
            return {
              ...venue,
              inWishlist: true,
              wishlistTags: item.tags,
              wishlistCategory: item.category
            };
          }
          return null;
        }).filter((v): v is Venue => v !== null);
        
        setWishlistVenues(wishlistVenues);
      }
    };
    
    loadWishlist();
    
    // Add event listener for storage changes
    window.addEventListener('storage', loadWishlist);
    
    return () => {
      window.removeEventListener('storage', loadWishlist);
    };
  }, []);
  
  // Add venue to wishlist
  const addToWishlist = (venue: Venue, tags: string[] = [], category?: string) => {
    WishlistService.addToWishlist(venue, tags, category);
    
    // Update local state
    const items = WishlistService.getWishlist();
    setWishlistItems(items);
    setCategories(WishlistService.getWishlistCategories());
    setTags(WishlistService.getWishlistTags());
    
    // Update wishlist venues
    setWishlistVenues(prev => {
      const exists = prev.some(v => v.id === venue.id);
      if (!exists) {
        return [...prev, { 
          ...venue, 
          inWishlist: true,
          wishlistTags: tags,
          wishlistCategory: category
        }];
      }
      return prev.map(v => {
        if (v.id === venue.id) {
          return {
            ...v,
            inWishlist: true,
            wishlistTags: tags,
            wishlistCategory: category
          };
        }
        return v;
      });
    });
  };
  
  // Remove venue from wishlist
  const removeFromWishlist = (venueId: string) => {
    WishlistService.removeFromWishlist(venueId);
    
    // Update local state
    const items = WishlistService.getWishlist();
    setWishlistItems(items);
    setCategories(WishlistService.getWishlistCategories());
    setTags(WishlistService.getWishlistTags());
    
    // Update wishlist venues
    setWishlistVenues(prev => prev.filter(v => v.id !== venueId));
  };
  
  // Check if venue is in wishlist
  const isInWishlist = (venueId: string): boolean => {
    return WishlistService.isInWishlist(venueId);
  };
  
  // Update wishlist item
  const updateWishlistItem = (venueId: string, updates: Partial<WishlistItem>) => {
    WishlistService.updateWishlistItem(venueId, updates);
    
    // Update local state
    const items = WishlistService.getWishlist();
    setWishlistItems(items);
    
    if (updates.category) {
      setCategories(WishlistService.getWishlistCategories());
    }
    
    if (updates.tags) {
      setTags(WishlistService.getWishlistTags());
    }
    
    // Update wishlist venues
    setWishlistVenues(prev => prev.map(v => {
      if (v.id === venueId) {
        return {
          ...v,
          wishlistTags: updates.tags || v.wishlistTags || [],
          wishlistCategory: updates.category || v.wishlistCategory
        };
      }
      return v;
    }));
  };
  
  return {
    wishlistItems,
    wishlistVenues,
    categories,
    tags,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    updateWishlistItem
  };
};
