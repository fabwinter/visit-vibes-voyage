
import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { RatingLevel } from '@/types';
import { Button } from '@/components/ui/button';

export type FilterOptions = {
  rating?: RatingLevel | 'all';
  category?: string | 'all';
  tags?: string[];
}

interface VenueFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  tags: string[];
}

const VenueFilters = ({ onFilterChange, categories, tags }: VenueFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    rating: 'all',
    category: 'all',
    tags: [],
  });

  const handleRatingChange = (value: RatingLevel | 'all') => {
    const newFilters = { ...filters, rating: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = { ...filters, category: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    let newTags: string[];
    
    if (currentTags.includes(tag)) {
      newTags = currentTags.filter(t => t !== tag);
    } else {
      newTags = [...currentTags, tag];
    }
    
    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      rating: 'all' as const,
      category: 'all' as const,
      tags: [] as string[],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = 
    filters.rating !== 'all' || 
    filters.category !== 'all' || 
    (filters.tags?.length || 0) > 0;

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4"
    >
      <div className="p-3 flex items-center justify-between">
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-visitvibe-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {(filters.rating !== 'all' ? 1 : 0) + 
               (filters.category !== 'all' ? 1 : 0) + 
               (filters.tags?.length || 0)}
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-xs h-7"
          >
            Clear all
          </Button>
        )}
      </div>
      
      <CollapsibleContent className="p-3 pt-0 space-y-4">
        {/* Rating filter */}
        <div>
          <label className="text-sm font-medium block mb-2">Rating</label>
          <ToggleGroup 
            type="single" 
            value={filters.rating} 
            onValueChange={(value) => value && handleRatingChange(value as RatingLevel | 'all')}
            className="flex flex-wrap justify-start gap-2"
          >
            <ToggleGroupItem value="all" className="text-xs h-7 rounded-full">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="good" className="text-xs h-7 rounded-full bg-green-50 data-[state=on]:bg-green-500 data-[state=on]:text-white">
              Good
            </ToggleGroupItem>
            <ToggleGroupItem value="mid" className="text-xs h-7 rounded-full bg-orange-50 data-[state=on]:bg-orange-500 data-[state=on]:text-white">
              OK
            </ToggleGroupItem>
            <ToggleGroupItem value="bad" className="text-xs h-7 rounded-full bg-red-50 data-[state=on]:bg-red-500 data-[state=on]:text-white">
              Avoid
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        {/* Category filter */}
        {categories.length > 0 && (
          <div>
            <label className="text-sm font-medium block mb-2">Category</label>
            <ToggleGroup 
              type="single" 
              value={filters.category} 
              onValueChange={(value) => value && handleCategoryChange(value)}
              className="flex flex-wrap justify-start gap-2"
            >
              <ToggleGroupItem value="all" className="text-xs h-7 rounded-full">
                All
              </ToggleGroupItem>
              {categories.map(category => (
                <ToggleGroupItem 
                  key={category} 
                  value={category}
                  className="text-xs h-7 rounded-full"
                >
                  {category}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
        
        {/* Tags filter */}
        {tags.length > 0 && (
          <div>
            <label className="text-sm font-medium block mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    filters.tags?.includes(tag) 
                      ? 'border-visitvibe-primary bg-visitvibe-primary text-white' 
                      : 'border-gray-300 hover:border-visitvibe-primary'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default VenueFilters;
