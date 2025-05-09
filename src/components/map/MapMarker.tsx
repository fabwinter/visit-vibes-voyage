
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
    
    // Determine marker color based on rating or category
    let markerColor = '#555555'; // Default gray
    
    if (venue.lastVisit?.rating?.overall) {
      const ratingLevel = getRatingLevel(venue.lastVisit.rating.overall);
      
      if (ratingLevel === 'good') markerColor = '#22c55e'; // Green for good rating
      else if (ratingLevel === 'mid') markerColor = '#f59e0b'; // Amber for mid rating
      else if (ratingLevel === 'bad') markerColor = '#ef4444'; // Red for bad rating
    } else {
      // If no rating, color by category
      const category = venue.category?.[0]?.toLowerCase() || '';
      
      if (category.includes('restaurant')) markerColor = '#8b5cf6'; // Purple for restaurants
      else if (category.includes('café') || category.includes('cafe') || category.includes('coffee')) markerColor = '#6366f1'; // Indigo for cafes
      else if (category.includes('bar') || category.includes('pub')) markerColor = '#f43f5e'; // Pink for bars
      else if (category.includes('bakery')) markerColor = '#f97316'; // Orange for bakeries
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
        viewBox="0 0 24 24" fill="${markerColor}" stroke="${isSelected ? '#fff' : '#fff'}" 
        stroke-width="${isSelected ? '2' : '1'}" stroke-linecap="round" stroke-linejoin="round"
        style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));">
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

    // Create a more detailed popup
    const newPopup = new mapboxgl.Popup({ 
      offset: 25, 
      closeButton: false,
      className: isSelected ? 'venue-popup-selected' : 'venue-popup',
      maxWidth: '220px'
    }).setHTML(`
      <div class="p-2 max-w-xs">
        <h3 class="font-medium text-sm">${venue.name}</h3>
        ${venue.category?.length ? `<p class="text-xs text-gray-500">${venue.category[0]}</p>` : ''}
        ${venue.lastVisit?.rating?.overall ? 
          `<div class="mt-1">
             <span class="text-xs font-medium" style="color: ${markerColor}">
               ${venue.lastVisit.rating.overall.toFixed(1)} ★
             </span>
           </div>` 
         : ''}
      </div>
    `);

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
      svg.setAttribute('stroke-width', isSelected ? '2' : '1');
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
