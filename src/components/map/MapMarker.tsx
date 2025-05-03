
import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Venue } from '@/types';
import { getRatingLevel } from '@/types';
import MarkerPopup from './MarkerPopup';

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
    let markerColor = '#555555'; // Default gray for unrated in grayscale theme
    
    if (venue.lastVisit?.rating?.overall) {
      const ratingLevel = getRatingLevel(venue.lastVisit.rating.overall);
      
      if (ratingLevel === 'good') markerColor = '#8E9196'; // Light gray for good
      else if (ratingLevel === 'mid') markerColor = '#555555'; // Medium gray for mid
      else if (ratingLevel === 'bad') markerColor = '#222222'; // Dark gray for bad
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

    // Create the marker
    const newMarker = new mapboxgl.Marker({ element: markerElement })
      .setLngLat([venue.coordinates.lng, venue.coordinates.lat])
      .addTo(map);
    
    // Add click listener to marker
    markerElement.addEventListener('click', () => {
      onMarkerClick(venue.id);
    });

    // Create a popup with venue info
    const newPopup = new mapboxgl.Popup({ 
      offset: 25, 
      closeButton: false,
      className: isSelected ? 'venue-popup-selected' : 'venue-popup',
      maxWidth: '300px'
    }).setHTML(document.createElement('div').innerHTML);

    // Add the React component to the popup
    const popupEl = newPopup.getElement();
    const reactContainer = document.createElement('div');
    popupEl?.appendChild(reactContainer);

    // Render the popup content using the MarkerPopup component
    const popupContent = document.createElement('div');
    popupContent.innerHTML = `
      <div class="p-3 max-w-xs">
        ${venue.photos && venue.photos.length > 0 ? 
          `<img src="${venue.photos[0]}" alt="${venue.name}" 
          class="w-full h-32 object-cover mb-2 rounded" 
          onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=No+Image';">` : ''}
        <h3 class="font-semibold text-base">${venue.name}</h3>
        <p class="text-sm text-gray-600">${venue.address}</p>
        ${venue.category ? `<p class="text-xs text-gray-500 mt-1">${venue.category.join(', ').replace(/_/g, ' ')}</p>` : ''}
      </div>
    `;
    reactContainer.appendChild(popupContent);

    // Set popup on marker
    newMarker.setPopup(newPopup);

    // If selected, show popup right away
    if (isSelected && map) {
      newPopup.addTo(map);
    } else {
      // Show popup on hover for non-selected venues
      markerElement.addEventListener('mouseenter', () => {
        if (map) {
          newPopup.addTo(map);
        }
      });
      
      markerElement.addEventListener('mouseleave', () => {
        newPopup.remove();
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
    el.style.width = isSelected ? '44px' : '36px';
    el.style.height = isSelected ? '44px' : '36px';
    el.style.zIndex = isSelected ? '1000' : '1';
    
    // Update SVG icon size and stroke width
    const svg = el.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', isSelected ? '36' : '24');
      svg.setAttribute('height', isSelected ? '36' : '24');
      svg.setAttribute('stroke', isSelected ? 'black' : 'white');
      svg.setAttribute('stroke-width', isSelected ? '3' : '2');
    }

    // Show popup for selected venue
    if (isSelected) {
      popup.addTo(map);
    } else {
      popup.remove();
    }
  }, [isSelected, marker, popup, map]);

  return null; // This is a non-visual component
};

export default MapMarker;
