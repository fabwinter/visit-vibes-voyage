
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Venue } from '@/types';
import { getRatingLevel } from '@/types';

interface MapComponentProps {
  venues: Venue[];
  onVenueSelect: (venueId: string) => void;
  userLocation?: { lat: number; lng: number };
  mapboxToken?: string;
}

const MapComponent = ({ venues, onVenueSelect, userLocation, mapboxToken }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [token, setToken] = useState<string>(mapboxToken || 'pk.eyJ1IjoiZmFiaWFud2ludGVyYmluZSIsImEiOiJjbWE2OWNuNG0wbzFuMmtwb3czNHB4cGJwIn0.KdxkppXglJrOwuBnqcYBqA');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);

  useEffect(() => {
    if (!token || !mapContainer.current) return;
    
    // Initialize map
    mapboxgl.accessToken = token;
    
    if (map.current) return; // Map already initialized
    
    const initialLocation = userLocation || { lat: 40.7128, lng: -74.0060 }; // Default to NYC if no user location
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11', // Changed to streets-v11 to include place names
      center: [initialLocation.lng, initialLocation.lat],
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add user location marker if available
    if (userLocation) {
      new mapboxgl.Marker({ color: '#3BB2D0' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    }

    // Add venue markers
    venues.forEach(venue => {
      if (!map.current) return;

      // Get the last visit for this venue to determine the marker color
      const lastVisit = venue.lastVisit;
      
      // Determine marker color based on rating
      let markerColor = '#BDBDBD'; // Default gray for unrated
      
      if (lastVisit?.rating?.overall) {
        const ratingLevel = getRatingLevel(lastVisit.rating.overall);
        
        if (ratingLevel === 'good') markerColor = '#4CAF50'; // Green for good
        else if (ratingLevel === 'mid') markerColor = '#FF9800'; // Orange for mid
        else if (ratingLevel === 'bad') markerColor = '#F44336'; // Red for bad
      }

      // Create a marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.backgroundColor = markerColor;
      markerElement.style.width = '24px';
      markerElement.style.height = '24px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.border = '2px solid white';
      markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

      // Create the marker
      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([venue.coordinates.lng, venue.coordinates.lat])
        .addTo(map.current);
      
      // Add click listener to marker
      marker.getElement().addEventListener('click', () => {
        onVenueSelect(venue.id);
      });

      // Create a popup with venue info
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${venue.name}</h3>
            <p class="text-sm text-gray-600">${venue.address}</p>
          </div>
        `);

      // Show popup on hover
      marker.getElement().addEventListener('mouseenter', () => {
        marker.setPopup(popup);
        popup.addTo(map.current!);
      });
      
      marker.getElement().addEventListener('mouseleave', () => {
        popup.remove();
      });
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [venues, token, userLocation, onVenueSelect]);

  // Center map to a venue
  const flyToVenue = (venueId: string) => {
    if (!map.current) return;
    
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return;
    
    map.current.flyTo({
      center: [venue.coordinates.lng, venue.coordinates.lat],
      zoom: 15,
      essential: true
    });
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTokenInput(false);
  };

  return (
    <div className="relative w-full h-full">
      {showTokenInput ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 p-4">
          <form onSubmit={handleTokenSubmit} className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Mapbox API Token Required</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please enter your Mapbox public token to enable the interactive map.
              You can get one from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-visitvibe-primary underline">mapbox.com</a>
            </p>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter your Mapbox public token"
            />
            <button 
              type="submit"
              className="bg-visitvibe-primary text-white px-4 py-2 rounded hover:bg-visitvibe-primary/90"
            >
              Apply Token
            </button>
          </form>
        </div>
      ) : (
        <>
          <div ref={mapContainer} className="w-full h-full rounded-lg" />
          {!map.current && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">Loading map...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MapComponent;
