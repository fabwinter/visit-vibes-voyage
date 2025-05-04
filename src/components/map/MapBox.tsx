
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
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  // Initialize map
  useEffect(() => {
    if (!token || !mapContainer.current) return;
    
    // Set access token before attempting to create the map
    mapboxgl.accessToken = token;
    
    if (map.current) return; // Map already initialized
    
    try {
      const initialLocation = userLocation && userLocation.lat !== 0 && userLocation.lng !== 0 
        ? userLocation 
        : { lat: -33.8688, lng: 151.2093 }; // Default to Sydney
      
      // Create the map instance
      const mapboxInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v10',
        center: [initialLocation.lng, initialLocation.lat],
        zoom: 14,
      });
      
      // Store map reference
      map.current = mapboxInstance;
      
      // Wait for map to load before adding controls or triggering other map operations
      mapboxInstance.on('load', () => {
        console.log('Mapbox map loaded successfully');
        
        // Now that the map is fully loaded, add navigation controls
        mapboxInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add grayscale filter to the map
        try {
          const mapStyle = mapboxInstance.getStyle();
          if (mapStyle && mapStyle.layers) {
            mapStyle.layers.forEach(layer => {
              if (layer.id !== 'background') {
                mapboxInstance.setPaintProperty(layer.id, 'raster-saturation', -1);
              }
            });
          }
        } catch (e) {
          console.warn('Failed to apply grayscale filter:', e);
        }
        
        // Add user location marker if available
        if (userLocation && userLocation.lat && userLocation.lng) {
          try {
            new mapboxgl.Marker({ color: '#3BB2D0' })
              .setLngLat([userLocation.lng, userLocation.lat])
              .addTo(mapboxInstance);
          } catch (e) {
            console.warn('Failed to add user location marker:', e);
          }
        }
        
        // Set map as initialized and make it available to other components
        setMapInitialized(true);
        setMapInstance(mapboxInstance);
      });
      
      // Add map move handler for "search this area" functionality
      if (onMapMove) {
        mapboxInstance.on('moveend', () => {
          // Clear previous timeout to prevent multiple rapid calls
          if (moveEndTimeout.current) {
            window.clearTimeout(moveEndTimeout.current);
          }
          
          // Set a small debounce to avoid excessive callbacks
          moveEndTimeout.current = window.setTimeout(() => {
            if (mapboxInstance) {
              const center = mapboxInstance.getCenter();
              onMapMove({ 
                lat: center.lat, 
                lng: center.lng 
              });
            }
          }, 300);
        });
      }
    } catch (error) {
      console.error('Failed to initialize Mapbox map:', error);
    }
    
    // Clean up on unmount
    return () => {
      if (moveEndTimeout.current) {
        window.clearTimeout(moveEndTimeout.current);
      }
      
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapInstance(null);
        setMapInitialized(false);
      }
    };
  }, [token, userLocation, onMapMove]);

  // When selectedVenue changes, center map on it
  useEffect(() => {
    if (!map.current || !selectedVenue || !mapInitialized) return;
    
    const venue = venues.find(v => v.id === selectedVenue);
    if (!venue) return;
    
    map.current.flyTo({
      center: [venue.coordinates.lng, venue.coordinates.lat],
      zoom: 15,
      essential: true
    });
  }, [selectedVenue, venues, mapInitialized]);

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
          {!mapInitialized && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">Loading map...</p>
            </div>
          )}
          
          {/* Only render markers when map is fully initialized */}
          {mapInitialized && mapInstance && venues.map(venue => (
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
