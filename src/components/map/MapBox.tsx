
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Venue } from '@/types';
import MapBoxMarker from './MapBoxMarker';
import MapTokenInput from './MapTokenInput';

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
  const [token, setToken] = useState<string>(mapboxToken || 'pk.eyJ1IjoiZmFiaWFud2ludGVyYmluZSIsImEiOiJjbWE2OWNuNG0wbzFuMmtwb3czNHB4cGJwIn0.KdxkppXglJrOwuBnqcYBqA');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);
  const moveEndTimeout = useRef<number | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

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
      
      setMapInstance(map.current);
      
      // Add grayscale filter to the map
      const mapStyle = map.current.getStyle();
      if (mapStyle && mapStyle.layers) {
        mapStyle.layers.forEach(layer => {
          if (layer.id !== 'background' && map.current) {
            map.current.setPaintProperty(layer.id, 'raster-saturation', -1);
          }
        });
      }
    });

    // Add user location marker if available
    if (userLocation && userLocation.lat && userLocation.lng) {
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
          if (map.current) {
            const center = map.current.getCenter();
            onMapMove({ 
              lat: center.lat, 
              lng: center.lng 
            });
          }
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

  // Token management handlers
  const handleTokenChange = (newToken: string) => {
    setToken(newToken);
  };

  const handleTokenSubmit = () => {
    setShowTokenInput(false);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {showTokenInput ? (
        <MapTokenInput 
          token={token} 
          onTokenChange={handleTokenChange} 
          onTokenSubmit={handleTokenSubmit} 
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
          {mapInstance && venues.map(venue => (
            <MapBoxMarker 
              key={venue.id}
              venue={venue}
              map={mapInstance}
              isSelected={selectedVenue === venue.id}
              onMarkerClick={onVenueSelect}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default MapBox;
