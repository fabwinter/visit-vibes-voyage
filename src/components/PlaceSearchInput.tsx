
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { PlacesService } from '@/services/PlacesService';
import { Venue } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PlaceSearchInputProps {
  onSelect: (venue: Venue | google.maps.places.PlaceResult) => void;
  userLocation: { lat: number; lng: number };
  className?: string;
  placeholder?: string;
}

const PlaceSearchInput = ({ 
  onSelect, 
  userLocation, 
  className = '', 
  placeholder = 'Search for restaurants, cafes...' 
}: PlaceSearchInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Search places when query changes
  useEffect(() => {
    const searchPlaces = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const venues = await PlacesService.searchPlaces(query, userLocation);
        setResults(venues);
      } catch (error) {
        console.error('Error searching places:', error);
        toast.error('Search failed. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    const debounce = setTimeout(searchPlaces, 300);
    return () => clearTimeout(debounce);
  }, [query, userLocation]);
  
  const handleSelect = async (venue: Venue) => {
    setQuery(venue.name);
    setIsOpen(false);
    
    // Get full details when a place is selected
    try {
      const details = await PlacesService.getVenueDetails(venue.id);
      if (details) {
        onSelect(details);
      } else {
        onSelect(venue);
      }
    } catch (error) {
      console.error('Error fetching venue details:', error);
      // If details fetch fails, still use the basic venue info
      onSelect(venue);
    }
  };
  
  return (
    <div className={cn("relative", className)} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-full border border-input bg-background"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="h-5 w-5 border-2 border-visitvibe-primary border-t-transparent animate-spin rounded-full"></div>
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg overflow-hidden border">
          <Command className="rounded-lg border shadow-md">
            <CommandList>
              {results.length === 0 && !isLoading ? (
                <CommandEmpty>{query.length < 2 ? 'Type to search...' : 'No results found'}</CommandEmpty>
              ) : (
                <CommandGroup heading="Suggestions">
                  {results.map((venue) => (
                    <CommandItem
                      key={venue.id}
                      onSelect={() => handleSelect(venue)}
                      className="cursor-pointer hover:bg-slate-100 p-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{venue.name}</span>
                        <span className="text-sm text-gray-500">{venue.address}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};

export default PlaceSearchInput;
