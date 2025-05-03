
import { useState, useRef } from 'react';

export const useMapInteraction = () => {
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const moveEndTimeout = useRef<number | null>(null);
  
  // Handle map move to show "Search this area" button
  const handleMapMove = (newCenter: { lat: number; lng: number }) => {
    // Only show the button if the center has moved significantly
    if (mapCenter) {
      const distance = calculateDistance(mapCenter, newCenter);
      if (distance > 1) { // If moved more than 1km
        setShowSearchThisArea(true);
      }
    }
  };
  
  // Calculate distance between two points in km
  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  return {
    mapCenter,
    setMapCenter,
    showSearchThisArea,
    setShowSearchThisArea,
    handleMapMove,
    moveEndTimeout
  };
};
