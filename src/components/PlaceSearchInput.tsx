
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { PlacesService } from '@/services/PlacesService';
import { Venue } from '@/types';
import { cn } from '@/lib/utils';
import { mockVenues } from '@/data/mockData';
import { toast } from 'sonner';

interface PlaceSearchInputProps {
  onSelect: (venue: Venue) => void;
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
        if (venues && venues.length > 0) {
          setResults(venues);
        } else {
          console.log("No venues found, falling back to mock data");
          // Filter mock data based on query
          const filteredMockVenues = mockVenues.filter(venue => 
            venue.name.toLowerCase().includes(query.toLowerCase()) || 
            venue.address.toLowerCase().includes(query.toLowerCase())
          );
          setResults(filteredMockVenues);
        }
      } catch (error) {
        console.error('Error searching places:', error);
        toast.error('Error searching places, using mock data');
        // Filter mock data based on query
        const filteredMockVenues = mockVenues.filter(venue => 
          venue.name.toLowerCase().includes(query.toLowerCase()) || 
          venue.address.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filteredMockVenues);
      } finally {
        setIsLoading(false);
      }
    };
    
    const debounce = setTimeout(searchPlaces, 300);
    return () => clearTimeout(debounce);
  }, [query, userLocation]);
  
  const handleSelect = async (venue: Venue) => {
    console.log("Selected venue:", venue);
    setQuery(venue.name);
    setIsOpen(false);
    
    // If venue already has valid coordinates, use it directly
    if (venue.coordinates && venue.coordinates.lat !== 0 && venue.coordinates.lng !== 0) {
      onSelect(venue);
      return;
    }
    
    // Get full details when a place is selected
    try {
      const details = await PlacesService.getVenueDetails(venue.id);
      if (details) {
        console.log("Got venue details:", details);
        onSelect(details);
      } else {
        console.log("No details found, using original venue");
        onSelect(venue);
      }
    } catch (error) {
      console.error('Error fetching venue details:', error);
      toast.error('Error fetching venue details');
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
          className="w-full pl-10 pr-4 py-6 rounded-full border border-input bg-background"
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
