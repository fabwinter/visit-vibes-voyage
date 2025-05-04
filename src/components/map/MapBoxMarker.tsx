
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Venue } from '@/types';
import { getRatingLevel } from '@/types';

interface MapMarkerProps {
  venue: Venue;
  map: mapboxgl.Map;
  isSelected: boolean;
  onMarkerClick: (venueId: string) => void;
}

const MapBoxMarker = ({ venue, map, isSelected, onMarkerClick }: MapMarkerProps) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    // Skip if we don't have valid data
    if (!venue || !venue.coordinates || !map || !venue.id) {
      console.error('Invalid venue data for marker:', venue);
      return;
    }

    try {
      // Determine marker color based on rating
      let markerColor = '#555555'; // Default gray for unrated in grayscale theme
      
      if (venue.lastVisit?.rating?.overall) {
        const ratingLevel = getRatingLevel(venue.lastVisit.rating.overall);
        
        if (ratingLevel === 'good') markerColor = '#8E9196'; // Light gray for good
        else if (ratingLevel === 'mid') markerColor = '#555555'; // Medium gray for mid
        else if (ratingLevel === 'bad') markerColor = '#222222'; // Dark gray for bad
      }

      // Create marker element with pin icon
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.width = isSelected ? '44px' : '36px';
      markerElement.style.height = isSelected ? '44px' : '36px';
      markerElement.style.display = 'flex';
      markerElement.style.justifyContent = 'center';
      markerElement.style.alignItems = 'center';
      markerElement.style.transition = 'all 0.3s ease';
      markerElement.style.cursor = 'pointer';
      markerElement.style.zIndex = isSelected ? '1000' : '1';
      
      // Create SVG icon - larger for selected venue
      markerElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? '36' : '24'}" height="${isSelected ? '36' : '24'}" 
          viewBox="0 0 24 24" fill="${markerColor}" stroke="${isSelected ? 'black' : 'white'}" 
          stroke-width="${isSelected ? '3' : '2'}" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      `;

      // Create the marker if it doesn't exist
      if (!markerRef.current) {
        const marker = new mapboxgl.Marker({ element: markerElement })
          .setLngLat([venue.coordinates.lng, venue.coordinates.lat]);
        
        // Make sure map is valid before adding
        if (map && map.getCanvas()) {
          marker.addTo(map);
          markerRef.current = marker;
          
          // Add click handler
          markerElement.addEventListener('click', () => {
            onMarkerClick(venue.id);
          });
        }
      } else {
        // Update existing marker
        markerRef.current
          .setLngLat([venue.coordinates.lng, venue.coordinates.lat])
          .getElement().innerHTML = markerElement.innerHTML;
      }

      // Create popup with venue info
      const popup = new mapboxgl.Popup({ 
        offset: 25, 
        closeButton: false,
        className: isSelected ? 'venue-popup-selected' : 'venue-popup',
        maxWidth: '300px'
      }).setHTML(`
        <div class="p-3 max-w-xs">
          ${venue.photos && venue.photos.length > 0 ? 
            `<img src="${venue.photos[0]}" alt="${venue.name}" 
            class="w-full h-32 object-cover mb-2 rounded" 
            onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=No+Image';">` : ''}
          <h3 class="font-semibold text-base">${venue.name}</h3>
          <p class="text-sm text-gray-600">${venue.address}</p>
          ${venue.category ? `<p class="text-xs text-gray-500 mt-1">${Array.isArray(venue.category) ? venue.category.join(', ').replace(/_/g, ' ') : venue.category}</p>` : ''}
        </div>
      `);

      // Store popup reference
      popupRef.current = popup;

      // Only add popup if we have a valid marker
      if (markerRef.current) {
        // Always show popup for selected venue
        if (isSelected) {
          markerRef.current.setPopup(popup);
          popup.addTo(map);
        } else {
          // Add hover behavior for non-selected markers
          const markerEl = markerRef.current.getElement();
          
          markerEl.addEventListener('mouseenter', () => {
            if (markerRef.current && map) {
              markerRef.current.setPopup(popup);
              popup.addTo(map);
            }
          });
          
          markerEl.addEventListener('mouseleave', () => {
            popup.remove();
          });
        }
      }
    } catch (error) {
      console.error('Error creating marker for venue:', venue.id, error);
    }

    // Cleanup
    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [venue, map, isSelected, onMarkerClick]);

  // This component doesn't render anything visible
  return null;
};

export default MapBoxMarker;
