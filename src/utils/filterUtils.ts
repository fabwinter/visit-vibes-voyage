
import { Venue, Visit, RatingLevel } from '@/types';
import { FilterOptions } from '@/components/VenueFilters';

export const filterVenues = (venues: Venue[], options: FilterOptions): Venue[] => {
  return venues.filter(venue => {
    // Filter by rating
    if (options.rating && options.rating !== 'all') {
      const lastVisit = venue.lastVisit;
      if (!lastVisit?.rating?.overall) return false;
      
      const venueRatingLevel = getRatingLevelFromScore(lastVisit.rating.overall);
      if (venueRatingLevel !== options.rating) return false;
    }

    // Filter by category
    if (options.category && options.category !== 'all') {
      if (!venue.category?.includes(options.category)) return false;
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      const venueTags = venue.lastVisit?.tags || [];
      // Check if any of the selected tags are in the venue tags
      if (!options.tags.some(tag => venueTags.includes(tag))) return false;
    }

    return true;
  });
};

export const getRatingLevelFromScore = (score: number): RatingLevel => {
  if (score >= 4) return 'good';
  if (score >= 3) return 'mid';
  return 'bad';
};

// Extract unique categories from venues
export const extractCategories = (venues: Venue[]): string[] => {
  const categoriesSet = new Set<string>();
  
  venues.forEach(venue => {
    if (venue.category) {
      venue.category.forEach(cat => categoriesSet.add(cat));
    }
  });
  
  return Array.from(categoriesSet);
};

// Extract unique tags from visits
export const extractTags = (venues: Venue[]): string[] => {
  const tagsSet = new Set<string>();
  
  venues.forEach(venue => {
    const tags = venue.lastVisit?.tags || [];
    tags.forEach(tag => tagsSet.add(tag));
  });
  
  return Array.from(tagsSet);
};
