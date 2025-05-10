
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Venue } from '@/types';
import MapMarker from './MapMarker';
import MapTokenInput from './MapTokenInput';
import { MAPBOX_TOKEN } from '@/services/places/config';

// Define venue category colors
const categoryColors = {
  'cafe': '#4CAF50',       // Green for cafes
  'restaurant': '#FF5722', // Orange for restaurants
  'bar': '#9C27B0',        // Purple for bars
  'fast_food': '#F44336',  // Red for fast food
  'bakery': '#FFEB3B',     // Yellow for bakeries
  'food': '#2196F3',       // Blue for general food
  'default': '#555555'     // Default gray
};

interface MapBoxProps {
  venues: Venue[];
  onVenueSelect: (venueId: string) => void;
  userLocation?: { lat: number; lng: number };
  mapboxToken?: string;
  selectedVenue?: string | null;
  className?: string;
  onMapMove?: (center: { lat: number; lng: number }) => void;
}

const MapBox = ({ 
  venues, 
  onVenueSelect, 
  userLocation, 
  mapboxToken, 
  selectedVenue, 
  className,
  onMapMove 
}: MapBoxProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [token, setToken] = useState<string>(mapboxToken || MAPBOX_TOKEN);
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);
  const moveEndTimeout = useRef<number | null>(null);

  // Initialize map
  useEffect(() => {
    if (!token || !mapContainer.current) return;
    
    mapboxgl.accessToken = token;
    
    if (map.current) return; // Map already initialized
    
    const initialLocation = userLocation || { lat: -33.8688, lng: 151.2093 }; // Default to Sydney
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10', // Use light style for better grayscale effect
      center: [initialLocation.lng, initialLocation.lat],
      zoom: 14, // Increased zoom level for better visibility
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Apply grayscale filter to the map
    map.current.on('load', () => {
      if (!map.current) return;
      
      try {
        // Add grayscale filter to the map
        const mapStyle = map.current.getStyle();
        if (mapStyle && mapStyle.layers) {
          mapStyle.layers.forEach(layer => {
            if (layer.id !== 'background' && map.current && layer.type === 'raster') {
              map.current.setPaintProperty(layer.id, 'raster-saturation', -1);
            }
          });
        }
      } catch (error) {
        console.warn("Error applying grayscale filter:", error);
      }
    });

    // Add user location marker if available
    if (userLocation) {
      new mapboxgl.Marker({ color: '#3BB2D0' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    }
    
    // Add map move handler for "search this area" functionality
    if (onMapMove) {
      map.current.on('moveend', () => {
        if (!map.current) return;
        
        // Clear previous timeout to prevent multiple rapid calls
        if (moveEndTimeout.current) {
          window.clearTimeout(moveEndTimeout.current);
        }
        
        // Set a small debounce to avoid excessive callbacks
        moveEndTimeout.current = window.setTimeout(() => {
          const center = map.current!.getCenter();
          onMapMove({ 
            lat: center.lat, 
            lng: center.lng 
          });
        }, 300);
      });
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      
      if (moveEndTimeout.current) {
        window.clearTimeout(moveEndTimeout.current);
      }
    };
  }, [token, userLocation, onMapMove]);

  // When selectedVenue changes, center map on it
  useEffect(() => {
    if (!map.current || !selectedVenue) return;
    
    const venue = venues.find(v => v.id === selectedVenue);
    if (!venue) return;
    
    map.current.flyTo({
      center: [venue.coordinates.lng, venue.coordinates.lat],
      zoom: 15,
      essential: true
    });
  }, [selectedVenue, venues]);

  // Get marker color based on venue category
  const getMarkerColorForVenue = (venue: Venue): string => {
    if (!venue.category || venue.category.length === 0) {
      return categoryColors.default;
    }
    
    // Convert categories to lowercase for matching
    const lowerCategories = venue.category.map(cat => cat.toLowerCase());
    
    // Check for specific categories
    for (const cat of lowerCategories) {
      for (const [key, color] of Object.entries(categoryColors)) {
        if (cat.includes(key)) {
          return color;
        }
      }
    }
    
    return categoryColors.default;
  };

  const handleTokenChange = (newToken: string) => {
    setToken(newToken);
    setShowTokenInput(false);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {showTokenInput ? (
        <MapTokenInput 
          isOpen={showTokenInput}
          onClose={() => setShowTokenInput(false)}
          onTokenSaved={handleTokenChange}
        />
      ) : (
        <>
          <div ref={mapContainer} className="w-full h-full rounded-lg" />
          {!map.current && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">Loading map...</p>
            </div>
          )}
          
          {/* Render markers for venues */}
          {map.current && venues.map(venue => (
            <MapMarker 
              key={venue.id}
              venue={venue}
              map={map.current!}
              isSelected={selectedVenue === venue.id}
              onMarkerClick={onVenueSelect}
              customColor={getMarkerColorForVenue(venue)}
            />
          ))}
        </>
      )}

      {/* Map category legend for mobile */}
      <div className="absolute bottom-10 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-md text-xs hidden md:block">
        <div className="text-xs font-semibold mb-1">Venue Types</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.restaurant }}></span>
            <span>Restaurant</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.cafe }}></span>
            <span>Café</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.bar }}></span>
            <span>Bar</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.fast_food }}></span>
            <span>Fast Food</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.default }}></span>
            <span>Other</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapBox;
