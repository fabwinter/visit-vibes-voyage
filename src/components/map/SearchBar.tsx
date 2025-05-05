
import { useState } from 'react';
import PlaceSearchInput from '../PlaceSearchInput';
import VenueFilters, { FilterOptions } from '../VenueFilters';
import { Venue } from '@/types';
import { extractCategories, extractTags } from '@/utils/filterUtils';

interface SearchBarProps {
  venues: Venue[];
  userLocation: { lat: number; lng: number };
  onFilterChange: (filters: FilterOptions) => void;
  onPlaceSelect: (venue: Venue) => void;
  className?: string;
}

const SearchBar = ({ 
  venues, 
  userLocation, 
  onFilterChange, 
  onPlaceSelect, 
  className = "" 
}: SearchBarProps) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    rating: 'all',
    category: 'all',
    tags: [],
  });
  
  // Extract unique categories and tags
  const categories = extractCategories(venues);
  const tags = extractTags(venues);
  
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className={className}>
      {/* Search with autocomplete */}
      <PlaceSearchInput 
        onSelect={onPlaceSelect}
        userLocation={userLocation}
        className="mb-4"
      />

      {/* Filters component */}
      <VenueFilters 
        onFilterChange={handleFilterChange}
        categories={categories}
        tags={tags}
      />
    </div>
  );
};

export default SearchBar;
