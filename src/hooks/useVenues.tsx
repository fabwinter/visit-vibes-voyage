import { useState, useEffect, useCallback, useMemo } from 'react';
import { Venue } from '@/types';
import { nearbySearch } from '@/services/places/placesService';
import { FOOD_PLACE_TYPES } from '@/services/places/config';
import mockData from '../mock_data.json';
import { useJsApiLoader } from '@react-google-maps/api';
import { useDebounce } from './useDebounce';
import { useSearchParams } from 'react-router-dom';
import { SEARCH_RADIUS } from '@/services/places/config';

const libraries = ['places'];

const useMockData = process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_DATA === 'true';

const mapResponseToVenues = (results: google.maps.places.PlaceResult[]): Venue[] => {
  return results.map(place => {
    const photoUrls = place.photos ? place.photos.map(photo => photo.getUrl({ maxWidth: 500, maxHeight: 500 })) : [];

    return {
      id: place.place_id || 'unknown',
      name: place.name || 'Unknown',
      address: place.formatted_address || 'No Address',
      coordinates: {
        lat: place.geometry?.location?.lat() || 0,
        lng: place.geometry?.location?.lng() || 0
      },
      photos: photoUrls,
      website: place.website || undefined,
      hours: place.opening_hours?.weekday_text.join('\n') || undefined,
      phoneNumber: place.formatted_phone_number || undefined,
      priceLevel: place.price_level || undefined,
      category: place.types || [],
      googleRating: place.rating || undefined,
      inWishlist: false,
      wishlistTags: [],
      wishlistCategory: ''
    };
  });
};

export const useVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [selectedVenueDetails, setSelectedVenueDetails] = useState<Venue | null>(null);
  const debouncedCenter = useDebounce(mapCenter, 500);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    libraries: libraries,
  });

  // Get initial location from params
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
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
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
  }, []);

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

  // Function to handle venue selection
  const handleVenueSelect = useCallback((venueId: string) => {
    setSelectedVenue(venueId);
    const venue = venues.find(v => v.id === venueId);
    setSelectedVenueDetails(venue || null);
  }, [venues]);

  // Modified search function to enforce the 2km radius
  const searchNearbyVenues = useCallback(async (location: google.maps.LatLngLiteral) => {
    setIsLoading(true);
    
    try {
      const response = await nearbySearch({
        location: location,
        radius: SEARCH_RADIUS, // Use the 2km radius constant
        types: FOOD_PLACE_TYPES,
        pageToken: null
      });
      
      if (response.results) {
        const newVenues = mapResponseToVenues(response.results);
        setVenues(newVenues);
        setNextPageToken(response.next_page_token || null);
      }
    } catch (error) {
      console.error('Failed to search nearby venues:', error);
      
      // If real API fails, use mock data
      if (useMockData) {
        const mockVenues = mockData.venues.map(venue => ({
          ...venue,
          coordinates: {
            lat: venue.coordinates.lat + (Math.random() - 0.5) * 0.01,
            lng: venue.coordinates.lng + (Math.random() - 0.5) * 0.01
          }
        }));
        setVenues(mockVenues);
        setUsingMockData(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [useMockData]);

  // Filter venues to those within the search radius
  const filterVenuesWithinRadius = useCallback((center: google.maps.LatLngLiteral, venues: Venue[], radius: number) => {
    return venues.filter(venue => {
      const distance = getDistanceBetweenPoints(
        center.lat, center.lng,
        venue.coordinates.lat, venue.coordinates.lng
      );
      return distance <= radius;
    });
  }, []);

  // Calculate distance between two points using Haversine formula
  const getDistanceBetweenPoints = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Calculate surrounding venues (close to selected venue)
  const calculateSurroundingVenues = useCallback(() => {
    if (!selectedVenue || !selectedVenueDetails) return [];
    
    const nearbyVenues = venues.filter(venue => {
      if (venue.id === selectedVenue) return false;
      
      const distance = getDistanceBetweenPoints(
        selectedVenueDetails.coordinates.lat, selectedVenueDetails.coordinates.lng,
        venue.coordinates.lat, venue.coordinates.lng
      );
      
      // Return venues within 500 meters of selected venue
      return distance <= 500;
    });
    
    // Sort by proximity
    return nearbyVenues.sort((a, b) => {
      const distanceA = getDistanceBetweenPoints(
        selectedVenueDetails.coordinates.lat, selectedVenueDetails.coordinates.lng,
        a.coordinates.lat, a.coordinates.lng
      );
      const distanceB = getDistanceBetweenPoints(
        selectedVenueDetails.coordinates.lat, selectedVenueDetails.coordinates.lng,
        b.coordinates.lat, b.coordinates.lng
      );
      return distanceA - distanceB;
    }).slice(0, 5); // Only show the 5 closest venues
  }, [selectedVenue, selectedVenueDetails, venues]);

  // Load initial venues or when the location changes
  useEffect(() => {
    if (!isLoaded) return;

    if (userLocation.lat && userLocation.lng) {
      searchNearbyVenues(userLocation);
    }
  }, [userLocation, isLoaded, searchNearbyVenues]);

  // Load more venues
  const handleLoadMore = useCallback(async () => {
    if (!nextPageToken) return;

    setIsLoading(true);
    try {
      const response = await nearbySearch({
        location: userLocation,
        radius: 2000,
        types: FOOD_PLACE_TYPES,
        pageToken: nextPageToken
      });

      if (response.results) {
        const newVenues = mapResponseToVenues(response.results);
        setVenues(prevVenues => [...prevVenues, ...newVenues]);
        setNextPageToken(response.next_page_token || null);
      }
    } catch (error) {
      console.error('Failed to load more venues:', error);
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, [nextPageToken, userLocation]);
  
  // Modified handleSearchThisArea to enforce radius
  const handleSearchThisArea = useCallback(() => {
    if (!mapCenter) return;
    
    searchNearbyVenues(mapCenter);
    setShowSearchThisArea(false);
  }, [mapCenter, searchNearbyVenues]);

  // Process the check-in data
  const processCheckIn = (visit: any) => {
    // Add the new visit
    // const updatedVisits = [visit, ...visits];
    // setVisits(updatedVisits);
    
    // Save visits to localStorage
    // localStorage.setItem('visits', JSON.stringify(updatedVisits));
    
    // toast.success("Check-in successful!");
  };
  
  // Compute surrounding venues on selected venue change
  const surroundingVenues = useMemo(() => calculateSurroundingVenues(), [selectedVenue, calculateSurroundingVenues]);
  
  // Return all necessary values
  return {
    venues,
    userLocation,
    isLoading,
    usingMockData,
    nextPageToken,
    showSearchThisArea,
    selectedVenue,
    selectedVenueDetails,
    surroundingVenues,
    setMapCenter,
    handleMapMove,
    handleSearchThisArea,
    handlePlaceSelect,
    handleVenueSelect,
    handleLoadMore,
    processCheckIn
  };
};
