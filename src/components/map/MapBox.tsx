
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Venue } from '@/types';
import MapMarker from './MapMarker';
import MapTokenInput from './MapTokenInput';
import { MAPBOX_TOKEN, DEFAULT_MAP_STYLE } from '@/services/places/config';
import { toast } from 'sonner';

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
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: DEFAULT_MAP_STYLE,
        center: [initialLocation.lng, initialLocation.lat],
        zoom: 14,
        pitchWithRotate: false,
        attributionControl: false
      });
  
      // Add attribution in a better position
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true
      }), 'bottom-left');
  
      // Add navigation controls with a cleaner UI
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: false,
          showZoom: true,
          showCompass: true
        }),
        'top-right'
      );
      
      // Add geolocation control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );
  
      // Add user location marker if available
      if (userLocation && userLocation.lat !== -33.8688) {
        new mapboxgl.Marker({
          color: '#ff4d94', // Pink color for MunchMapper branding
          scale: 0.8
        })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map.current);
      }
  
      // Enhance map with visual improvements
      map.current.on('load', () => {
        if (!map.current) return;
        
        // Add 3D buildings for a more immersive experience
        map.current.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        });
  
        toast.success("Map loaded successfully", {
          description: "Explore food venues in your area",
          duration: 3000
        });
      });
      
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
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Failed to initialize map", {
        description: "Please check your connection and reload"
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
      zoom: 16,
      essential: true,
      duration: 1000,
      padding: { top: 50, bottom: 50, left: 50, right: 50 }
    });
  }, [selectedVenue, venues]);

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
          {/* Map container with improved styling */}
          <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200" />
          
          {/* Loading state */}
          {!map.current && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 bg-opacity-80 rounded-xl">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-gray-500 font-medium">Loading map...</p>
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
            />
          ))}
          
          {/* Map overlay gradient for better readability */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent opacity-60 pointer-events-none"></div>
        </>
      )}
    </div>
  );
};

export default MapBox;
