
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Venue } from '@/types';
import { MAPBOX_TOKEN } from '@/services/foursquare/config';
import MapMarker from './MapMarker';
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
  const token = mapboxToken || MAPBOX_TOKEN;
  const moveEndTimeout = useRef<number | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    try {
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

      // Handle successful map load
      map.current.on('load', () => {
        if (mapError) setMapError(null);
      });

      // Handle map errors
      map.current.on('error', (e) => {
        console.error("Mapbox error:", e);
        setMapError("Map failed to load properly. Please check your connection and try again.");
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map. Please check your connection and try again.");
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
  }, [token, userLocation, onMapMove, mapError]);

  // When selectedVenue changes, center map on it
  useEffect(() => {
    if (!map.current || !selectedVenue) return;
    
    const venue = venues.find(v => v.id === selectedVenue);
    if (!venue) return;
    
    try {
      map.current.flyTo({
        center: [venue.coordinates.lng, venue.coordinates.lat],
        zoom: 15,
        essential: true
      });
    } catch (error) {
      console.error("Error centering map on venue:", error);
    }
  }, [selectedVenue, venues]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {!map.current && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-visitvibe-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="bg-white p-4 rounded-lg shadow-md max-w-md text-center">
            <p className="text-red-500 font-medium mb-2">{mapError}</p>
            <p className="text-gray-600 text-sm mb-4">We're using mock data so you can still explore the app.</p>
            <button 
              className="bg-visitvibe-primary text-white px-4 py-2 rounded-md"
              onClick={() => window.location.reload()}
            >
              Reload Map
            </button>
          </div>
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
    </div>
  );
};

export default MapBox;
