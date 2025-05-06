
import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Venue } from '@/types';
import { getRatingLevel } from '@/types';

interface MapMarkerProps {
  venue: Venue;
  map: mapboxgl.Map;
  isSelected: boolean;
  onMarkerClick: (venueId: string) => void;
}

const MapMarker = ({ 
  venue, 
  map, 
  isSelected, 
  onMarkerClick 
}: MapMarkerProps) => {
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [popup, setPopup] = useState<mapboxgl.Popup | null>(null);

  // Create marker element and add it to the map
  useEffect(() => {
    if (!map) return;
    
    // Determine marker color based on rating
    let markerColor = '#ff4d94'; // Default pink for MunchMapper branding
    
    if (venue.lastVisit?.rating?.overall) {
      const ratingLevel = getRatingLevel(venue.lastVisit.rating.overall);
      
      if (ratingLevel === 'good') markerColor = '#22c55e'; // Green
      else if (ratingLevel === 'mid') markerColor = '#f59e0b'; // Yellow/orange
      else if (ratingLevel === 'bad') markerColor = '#ef4444'; // Red
    }

    // Create a marker element with fork and spoon icon shape
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.style.width = isSelected ? '48px' : '40px';
    markerElement.style.height = isSelected ? '48px' : '40px';
    markerElement.style.display = 'flex';
    markerElement.style.justifyContent = 'center';
    markerElement.style.alignItems = 'center';
    markerElement.style.transition = 'all 0.3s ease';
    markerElement.style.cursor = 'pointer';
    markerElement.style.zIndex = isSelected ? '1000' : '1';
    markerElement.style.filter = isSelected ? 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' : 'none';
    markerElement.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)';
    
    // Create SVG icon - custom fork and spoon icon in a pin shape
    markerElement.innerHTML = `
      <svg width="${isSelected ? '48' : '40'}" height="${isSelected ? '48' : '40'}" viewBox="0 0 24 24" fill="${markerColor}" stroke="${isSelected ? 'white' : 'white'}" 
        stroke-width="${isSelected ? '2' : '1.5'}" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="${markerColor}" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="10" r="3" fill="white" stroke="none"/>
        <path d="M14 7.5c0-1.5-2-1.5-2-3s2-1.5 2-3" stroke="white" stroke-width="1" fill="none" />
        <path d="M10 7.5c0-1.5 2-1.5 2-3s-2-1.5-2-3" stroke="white" stroke-width="1" fill="none" />
      </svg>
    `;

    // Create the marker
    const newMarker = new mapboxgl.Marker({ element: markerElement })
      .setLngLat([venue.coordinates.lng, venue.coordinates.lat])
      .addTo(map);
    
    // Add click listener to marker
    markerElement.addEventListener('click', () => {
      onMarkerClick(venue.id);
    });

    // Create a beautiful popup with venue info
    const newPopup = new mapboxgl.Popup({ 
      offset: 25, 
      closeButton: false,
      className: isSelected ? 'venue-popup-selected' : 'venue-popup',
      maxWidth: '300px',
      closeOnClick: false
    }).setHTML(`
      <div class="p-3 max-w-xs bg-white rounded-lg shadow-md border border-gray-100">
        ${venue.photos && venue.photos.length > 0 ? 
          `<img src="${venue.photos[0]}" alt="${venue.name}" 
          class="w-full h-32 object-cover mb-2 rounded-md" 
          onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=MunchMapper';">` : ''}
        <h3 class="font-semibold text-base text-gray-800">${venue.name}</h3>
        <p class="text-sm text-gray-600 mt-1">${venue.address}</p>
        ${venue.category ? `
          <div class="flex mt-2">
            ${venue.category.map(cat => `
              <span class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mr-1">
                ${cat.replace(/_/g, ' ')}
              </span>
            `).join('')}
          </div>
        ` : ''}
        ${venue.lastVisit ? `
          <div class="mt-2 pt-2 border-t border-gray-100">
            <div class="flex items-center">
              <span class="text-xs font-medium text-gray-500">Your rating:</span>
              <div class="ml-1 flex">
                ${Array.from({ length: Math.round(venue.lastVisit.rating.overall) }).map(() => 
                  `<svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>`
                ).join('')}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `);

    // Set popup behavior
    if (isSelected) {
      newMarker.setPopup(newPopup);
      newPopup.addTo(map);
    } else {
      // Show popup on hover
      markerElement.addEventListener('mouseenter', () => {
        newMarker.setPopup(newPopup);
        newPopup.addTo(map);
      });
      
      markerElement.addEventListener('mouseleave', () => {
        setTimeout(() => {
          if (newPopup.isOpen()) newPopup.remove();
        }, 500); // Small delay to allow moving cursor to popup
      });
    }

    // Store references
    setMarker(newMarker);
    setPopup(newPopup);

    // Clean up on unmount
    return () => {
      newMarker.remove();
      newPopup.remove();
    };
  }, [map, venue, isSelected, onMarkerClick]);

  // Update marker when selected state changes
  useEffect(() => {
    if (!marker || !popup) return;

    const el = marker.getElement();
    
    // Update size and z-index based on selection
    el.style.width = isSelected ? '48px' : '40px';
    el.style.height = isSelected ? '48px' : '40px';
    el.style.zIndex = isSelected ? '1000' : '1';
    el.style.filter = isSelected ? 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' : 'none';
    el.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)';
    
    // Update SVG icon size
    const svg = el.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', isSelected ? '48' : '40');
      svg.setAttribute('height', isSelected ? '48' : '40');
      svg.setAttribute('stroke-width', isSelected ? '2' : '1.5');
    }

    // Show popup for selected venue
    if (isSelected) {
      marker.setPopup(popup);
      popup.addTo(map);
    } else {
      popup.remove();
    }
  }, [isSelected, marker, popup, map]);

  return null; // This is a non-visual component
};

export default MapMarker;
