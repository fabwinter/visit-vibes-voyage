
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';

export const useLocationState = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const debouncedCenter = useDebounce(mapCenter, 500);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial location from URL params
  useEffect(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      setUserLocation({ lat: latitude, lng: longitude });
    }
  }, [searchParams]);

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation || userLocation.lat !== 0) {
      return;
    }

    const success = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
    };

    const error = () => {
      console.warn("Unable to retrieve your location.");
    };

    navigator.geolocation.getCurrentPosition(success, error);
  }, [userLocation.lat]);

  // Function to handle map move and update the map center
  const handleMapMove = useCallback((center: { lat: number; lng: number }) => {
    setMapCenter(center);
    setShowSearchThisArea(true);
  }, []);

  // Function to handle place selection from the search bar
  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place && place.geometry && place.geometry.location) {
      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setUserLocation(newLocation);
      setMapCenter(newLocation);
    }
  }, []);
  
  // Handle searching in the current map area
  const handleSearchThisArea = useCallback(() => {
    if (!mapCenter) return;
    
    setUserLocation(mapCenter);
    setShowSearchThisArea(false);
  }, [mapCenter]);
  
  return {
    userLocation,
    mapCenter,
    showSearchThisArea,
    setMapCenter,
    handleMapMove,
    handlePlaceSelect,
    handleSearchThisArea
  };
};
