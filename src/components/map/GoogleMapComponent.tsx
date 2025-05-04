
import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { Venue } from '@/types';
import { getRatingLevel } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface GoogleMapComponentProps {
  venues: Venue[];
  onVenueSelect: (venueId: string) => void;
  userLocation?: { lat: number; lng: number };
  selectedVenue?: string | null;
  className?: string;
  onMapMove?: (center: { lat: number; lng: number }) => void;
  searchRadius?: number;
  mapStyle?: string;
}

// Grayscale map style
const grayscaleMapStyle = [
  {
    featureType: "all",
    elementType: "all",
    stylers: [
      { saturation: -100 }
    ]
  }
];

const GoogleMapComponent = ({
  venues,
  onVenueSelect,
  userLocation,
  selectedVenue,
  className,
  onMapMove,
  searchRadius = 2000,
  mapStyle = "grayscale"
}: GoogleMapComponentProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindow, setInfoWindow] = useState<string | null>(null);
  const [apiLoaded, setApiLoaded] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const moveEndTimeout = useRef<number | null>(null);
  const isMobile = useIsMobile();
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // Get marker icon based on rating and selection status
  const getMarkerIcon = (venue: Venue, isSelected: boolean) => {
    if (typeof window.google === 'undefined' || !window.google.maps) {
      return null;
    }
    
    // Determine marker color based on rating
    let fillColor = '#555555'; // Default gray for unrated
    
    if (venue.lastVisit?.rating?.overall) {
      const ratingLevel = getRatingLevel(venue.lastVisit.rating.overall);
      
      if (ratingLevel === 'good') fillColor = '#8E9196'; // Light gray for good
      else if (ratingLevel === 'mid') fillColor = '#555555'; // Medium gray for mid
      else if (ratingLevel === 'bad') fillColor = '#222222'; // Dark gray for bad
    }
    
    // SVG path for a map pin
    const scale = isSelected ? 1.5 : 1;
    
    return {
      path: "M12,0C7.6,0,4,3.6,4,8c0,5.4,8,16,8,16s8-10.6,8-16C20,3.6,16.4,0,12,0z M12,11.5c-1.9,0-3.5-1.6-3.5-3.5s1.6-3.5,3.5-3.5s3.5,1.6,3.5,3.5S13.9,11.5,12,11.5z",
      fillColor: fillColor,
      fillOpacity: 1,
      strokeWeight: isSelected ? 2 : 1,
      strokeColor: isSelected ? "#000000" : "#FFFFFF",
      scale: scale,
      anchor: new window.google.maps.Point(12, 24),
    };
  };

  // Handle map load
  const onLoad = useCallback((map: google.maps.Map) => {
    console.log("Google Maps loaded successfully");
    setMap(map);
    setApiLoaded(true);
    
    // Center on user location if available
    if (userLocation) {
      map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
      map.setZoom(14);
    }
  }, [userLocation]);

  const onLoadError = useCallback((error: Error) => {
    console.error("Google Maps failed to load:", error);
    setApiError("Failed to load Google Maps. Please try again later.");
    toast.error("Failed to load Google Maps");
  }, []);

  // Handle map move to show "Search this area" button
  const handleBoundsChanged = () => {
    if (!map || !onMapMove) return;
    
    // Clear previous timeout to prevent multiple rapid calls
    if (moveEndTimeout.current) {
      window.clearTimeout(moveEndTimeout.current);
    }
    
    // Set a small debounce to avoid excessive callbacks
    moveEndTimeout.current = window.setTimeout(() => {
      const center = map.getCenter();
      if (center) {
        onMapMove({
          lat: center.lat(),
          lng: center.lng()
        });
      }
    }, 300);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (moveEndTimeout.current) {
        window.clearTimeout(moveEndTimeout.current);
      }
    };
  }, []);

  // Focus map on selected venue
  useEffect(() => {
    if (!map || !selectedVenue) return;
    
    const venue = venues.find(v => v.id === selectedVenue);
    if (!venue) return;
    
    map.panTo({ lat: venue.coordinates.lat, lng: venue.coordinates.lng });
    map.setZoom(16);
    setInfoWindow(selectedVenue);
  }, [selectedVenue, venues, map]);

  // Find the venue by ID
  const getVenueById = (id: string) => {
    return venues.find(venue => venue.id === id);
  };

  if (!googleMapsApiKey) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-gray-100 rounded-md ${className}`}>
        <div className="p-4 bg-white shadow-md rounded-md">
          <h3 className="text-lg font-semibold mb-2 text-red-500">Google Maps API key not set</h3>
          <p className="text-sm text-gray-600">
            Please set your Google Maps API key in the environment variables.
            <br />
            Add the key to the <code>.env</code> file as <code>VITE_GOOGLE_MAPS_API_KEY=your_api_key</code>
          </p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-gray-100 rounded-md ${className}`}>
        <div className="p-4 bg-white shadow-md rounded-md">
          <h3 className="text-lg font-semibold mb-2 text-red-500">Error loading Google Maps</h3>
          <p className="text-sm text-gray-600">{apiError}</p>
          <button 
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <LoadScript 
        googleMapsApiKey={googleMapsApiKey}
        onLoad={() => console.log("Script loaded successfully")}
        onError={onLoadError}
        loadingElement={
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
            <p className="text-gray-500">Loading map...</p>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
          options={{
            styles: mapStyle === "grayscale" ? grayscaleMapStyle : undefined,
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: false,
          }}
          zoom={14}
          center={userLocation || { lat: -33.8688, lng: 151.2093 }} // Default to Sydney if no user location
          onLoad={onLoad}
          onBoundsChanged={handleBoundsChanged}
        >
          {apiLoaded && window.google && window.google.maps && (
            <>
              {/* Search radius circle */}
              {userLocation && searchRadius && (
                <Circle
                  center={userLocation}
                  radius={searchRadius}
                  options={{
                    strokeColor: "#3BB2D0",
                    strokeOpacity: 0.5,
                    strokeWeight: 1,
                    fillColor: "#3BB2D0",
                    fillOpacity: 0.1,
                  }}
                />
              )}
              
              {/* User location marker */}
              {userLocation && (
                <Marker
                  position={{ lat: userLocation.lat, lng: userLocation.lng }}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: '#3BB2D0',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF',
                    scale: 8,
                  }}
                  zIndex={1000}
                />
              )}

              {/* Venue markers */}
              {venues.map((venue) => {
                const isSelected = selectedVenue === venue.id;
                const icon = getMarkerIcon(venue, isSelected);
                
                if (!icon) return null;
                
                return (
                  <Marker
                    key={venue.id}
                    position={{ lat: venue.coordinates.lat, lng: venue.coordinates.lng }}
                    onClick={() => {
                      onVenueSelect(venue.id);
                      setInfoWindow(venue.id);
                    }}
                    icon={icon}
                    zIndex={isSelected ? 999 : 1}
                  />
                );
              })}

              {/* Info windows */}
              {infoWindow && (
                <InfoWindow
                  position={getVenueById(infoWindow)?.coordinates || { lat: 0, lng: 0 }}
                  onCloseClick={() => setInfoWindow(null)}
                >
                  <div className="p-2 max-w-xs">
                    {getVenueById(infoWindow)?.photos && getVenueById(infoWindow)?.photos.length > 0 ? (
                      <img 
                        src={getVenueById(infoWindow)?.photos[0]} 
                        alt={getVenueById(infoWindow)?.name} 
                        className="w-full h-24 object-cover mb-2 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                        }}
                      />
                    ) : null}
                    <h3 className="font-semibold text-sm">{getVenueById(infoWindow)?.name}</h3>
                    <p className="text-xs text-gray-600">{getVenueById(infoWindow)?.address}</p>
                  </div>
                </InfoWindow>
              )}
            </>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default GoogleMapComponent;
