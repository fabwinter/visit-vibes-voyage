
import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Venue } from '@/types';
import { getRatingLevel } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface GoogleMapComponentProps {
  venues: Venue[];
  onVenueSelect: (venueId: string) => void;
  userLocation?: { lat: number; lng: number };
  selectedVenue?: string | null;
  className?: string;
  onMapMove?: (center: { lat: number; lng: number }) => void;
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
  onMapMove
}: GoogleMapComponentProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindow, setInfoWindow] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const moveEndTimeout = useRef<number | null>(null);
  const isMobile = useIsMobile();

  // Get marker icon based on rating and selection status
  const getMarkerIcon = (venue: Venue, isSelected: boolean) => {
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
      anchor: new google.maps.Point(12, 24),
    };
  };

  // Handle map load
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Center on user location if available
    if (userLocation) {
      map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
      map.setZoom(14);
    }
  }, [userLocation]);

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

  return (
    <div className={`relative w-full h-full ${className}`}>
      <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY || ""}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
          options={{
            styles: grayscaleMapStyle,
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
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={{ lat: userLocation.lat, lng: userLocation.lng }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
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
            return (
              <Marker
                key={venue.id}
                position={{ lat: venue.coordinates.lat, lng: venue.coordinates.lng }}
                onClick={() => {
                  onVenueSelect(venue.id);
                  setInfoWindow(venue.id);
                }}
                icon={getMarkerIcon(venue, isSelected)}
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
        </GoogleMap>
      </LoadScript>

      {!process.env.GOOGLE_MAPS_API_KEY && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 p-4 text-center">
          <div>
            <p className="text-red-500 font-bold">Google Maps API key not set</p>
            <p className="text-sm mt-2">
              Please add your Google Maps API key to the environment variables.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;
