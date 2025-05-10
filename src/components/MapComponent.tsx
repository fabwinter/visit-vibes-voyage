
import React, { useEffect, useRef, useState } from 'react';
import { Venue } from '@/types';
import { API_KEY } from '@/services/places/config';
import MapPlaceholder from './MapPlaceholder';

interface MapComponentProps {
  venues: Venue[];
  onVenueSelect: (venueId: string) => void;
  userLocation?: { lat: number; lng: number };
  selectedVenue?: string | null;
  className?: string;
  onMapMove?: (center: { lat: number; lng: number }) => void;
}

const MapComponent = ({ 
  venues, 
  onVenueSelect, 
  userLocation, 
  selectedVenue, 
  className,
  onMapMove
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const googleMapsScript = document.getElementById('google-maps-script');
    if (!googleMapsScript) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => {
        setIsLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setLoadError(true);
      };
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup if component unmounts during loading
      const script = document.getElementById('google-maps-script');
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize map when API is loaded and mapRef is available
  useEffect(() => {
    if (!isLoaded || !mapRef.current || loadError || !window.google?.maps) return;

    try {
      const initialLocation = userLocation || { lat: -33.8688, lng: 151.2093 }; // Default to Sydney
      
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: initialLocation,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false, // Removed fullscreen control
        zoomControl: false, // Removed zoom control
        styles: [
          {
            "stylers": [
              { "saturation": -100 }
            ]
          }
        ]
      });

      // Add event listener for map movement if callback provided
      if (onMapMove) {
        mapInstance.addListener('idle', () => {
          const center = mapInstance.getCenter();
          if (center) {
            onMapMove({
              lat: center.lat(),
              lng: center.lng()
            });
          }
        });
      }

      setMap(mapInstance);
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setLoadError(true);
    }
  }, [isLoaded, mapRef.current, userLocation, onMapMove]);

  // Add markers for venues
  useEffect(() => {
    if (!map || !venues.length || !window.google?.maps) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    // Create new markers
    const newMarkers = venues.map(venue => {
      // Determine marker color based on rating if available
      let markerColor = '#555555'; // Default gray
      
      if (venue.lastVisit?.rating?.overall) {
        const rating = venue.lastVisit.rating.overall;
        if (rating >= 4) markerColor = '#8E9196'; // Light gray for good
        else if (rating >= 3) markerColor = '#555555'; // Medium gray for mid
        else markerColor = '#222222'; // Dark gray for bad
      }
      
      const isSelected = selectedVenue === venue.id;
      
      // Create marker
      const marker = new window.google.maps.Marker({
        position: { lat: venue.coordinates.lat, lng: venue.coordinates.lng },
        map: map,
        title: venue.name,
        animation: isSelected ? window.google.maps.Animation.BOUNCE : null,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: isSelected ? '#000' : '#fff',
          strokeWeight: isSelected ? 2 : 1,
          scale: isSelected ? 10 : 8
        }
      });
      
      // Add click listener
      marker.addListener('click', () => {
        onVenueSelect(venue.id);
      });
      
      // Add simple InfoWindow
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div class="p-2"><strong>${venue.name}</strong></div>`
      });
      
      // Show info window on hover
      marker.addListener('mouseover', () => {
        infoWindow.open(map, marker);
      });
      
      marker.addListener('mouseout', () => {
        infoWindow.close();
      });
      
      return marker;
    });
    
    setMarkers(newMarkers);
    
    // If there's a selected venue, center map on it
    if (selectedVenue) {
      const venue = venues.find(v => v.id === selectedVenue);
      if (venue) {
        map.setCenter({ lat: venue.coordinates.lat, lng: venue.coordinates.lng });
        map.setZoom(15);
      }
    }
    
    return () => {
      // Clean up markers when unmounting or updating
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, venues, selectedVenue, onVenueSelect]);
  
  // Add user location marker if available
  useEffect(() => {
    if (!map || !userLocation || !window.google?.maps) return;
    
    new window.google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map: map,
      title: 'Your location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#4285F4',
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 10
      }
    });
  }, [map, userLocation]);

  // If API failed to load, show placeholder
  if (loadError) {
    return (
      <MapPlaceholder 
        className={className}
        message="Failed to load Google Maps. Please check your API key and try again."
      />
    );
  }

  // Show loading placeholder until map is ready
  if (!isLoaded) {
    return (
      <MapPlaceholder 
        className={className}
        message="Loading Google Maps..."
      />
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full rounded-lg ${className || ''}`}
      aria-label="Google Map with venue markers"
    />
  );
};

export default MapComponent;
