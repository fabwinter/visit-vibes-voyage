
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Venue } from '@/types';
import { getRatingLevel } from '@/types';
import { MapPinIcon } from 'lucide-react';

interface MapComponentProps {
  venues: Venue[];
  onVenueSelect: (venueId: string) => void;
  userLocation?: { lat: number; lng: number };
  mapboxToken?: string;
  selectedVenue?: string | null;
}

const MapComponent = ({ venues, onVenueSelect, userLocation, mapboxToken, selectedVenue }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [token, setToken] = useState<string>(mapboxToken || 'pk.eyJ1IjoiZmFiaWFud2ludGVyYmluZSIsImEiOiJjbWE2OWNuNG0wbzFuMmtwb3czNHB4cGJwIn0.KdxkppXglJrOwuBnqcYBqA');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (!token || !mapContainer.current) return;
    
    // Initialize map
    mapboxgl.accessToken = token;
    
    if (map.current) return; // Map already initialized
    
    const initialLocation = userLocation || { lat: -33.8688, lng: 151.2093 }; // Default to Sydney
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // Changed to light-v11 for grayscale look
      center: [initialLocation.lng, initialLocation.lat],
      zoom: 13, // Increased zoom level for better visibility
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add user location marker if available
    if (userLocation) {
      new mapboxgl.Marker({ color: '#3BB2D0' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [token, userLocation]);

  // Update markers when venues or selected venue changes
  useEffect(() => {
    if (!map.current) return;
    
    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};
    
    // Add venue markers
    venues.forEach(venue => {
      if (!map.current) return;
      
      // Determine if this is the selected venue
      const isSelected = selectedVenue === venue.id;

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

      // Create a marker element with pin icon
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.width = isSelected ? '44px' : '36px';
      markerElement.style.height = isSelected ? '44px' : '36px';
      markerElement.style.display = 'flex';
      markerElement.style.justifyContent = 'center';
      markerElement.style.alignItems = 'center';
      markerElement.style.transition = 'all 0.3s ease';
      
      // Create SVG icon - larger for selected venue
      markerElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? '36' : '24'}" height="${isSelected ? '36' : '24'}" 
          viewBox="0 0 24 24" fill="${markerColor}" stroke="${isSelected ? 'black' : 'white'}" 
          stroke-width="${isSelected ? '3' : '2'}" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      `;

      // Create the marker
      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([venue.coordinates.lng, venue.coordinates.lat])
        .addTo(map.current);
      
      // Store marker reference
      markers.current[venue.id] = marker;
      
      // Add click listener to marker
      marker.getElement().addEventListener('click', () => {
        onVenueSelect(venue.id);
      });

      // Create a popup with venue info
      const popup = new mapboxgl.Popup({ 
        offset: 25, 
        closeButton: false,
        className: isSelected ? 'venue-popup-selected' : 'venue-popup'
      }).setHTML(`
        <div class="p-3 max-w-xs">
          ${venue.photos && venue.photos.length > 0 ? 
            `<img src="${venue.photos[0]}" alt="${venue.name}" 
            class="w-full h-32 object-cover mb-2 rounded" 
            onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=No+Image';">` : ''}
          <h3 class="font-semibold text-base">${venue.name}</h3>
          <p class="text-sm text-gray-600">${venue.address}</p>
          ${venue.category ? `<p class="text-xs text-gray-500 mt-1">${venue.category.join(', ')}</p>` : ''}
        </div>
      `);

      // Always show popup for selected venue
      if (isSelected) {
        marker.setPopup(popup);
        popup.addTo(map.current);
      } else {
        // Show popup on hover for non-selected venues
        marker.getElement().addEventListener('mouseenter', () => {
          marker.setPopup(popup);
          popup.addTo(map.current!);
        });
        
        marker.getElement().addEventListener('mouseleave', () => {
          popup.remove();
        });
      }
    });
  }, [venues, selectedVenue, onVenueSelect]);

  // Center map to selected venue when it changes
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
