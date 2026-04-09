import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const containerStyle = { width: '100%', height: '100%' };
const cairoCenter = { lat: 30.0444, lng: 31.2357 };
const libraries: ('places')[] = ['places'];

interface MapViewProps {
  markers?: { lat: number; lng: number; label?: string; color?: 'red' | 'green' | 'blue' }[];
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  showDirections?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

const MapView = ({ markers = [], origin, destination, showDirections = false, center, zoom = 12, className = '', onMapClick }: MapViewProps) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    if (showDirections && origin && destination) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === 'OK' && result) setDirections(result);
      });
    }
  }, [origin, destination, showDirections]);

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className={`bg-muted rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <p className="text-muted-foreground text-sm font-medium">Google Maps API Key Required</p>
          <p className="text-xs text-muted-foreground mt-1">Add VITE_GOOGLE_MAPS_API_KEY to .env</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`bg-muted rounded-xl flex items-center justify-center ${className}`}>
        <p className="text-destructive text-sm">Failed to load Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-muted rounded-xl flex items-center justify-center ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center || cairoCenter}
        zoom={zoom}
        onLoad={onLoad}
        onClick={(e) => onMapClick?.(e.latLng?.lat() || 0, e.latLng?.lng() || 0)}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {markers.map((marker, i) => (
          <Marker
            key={i}
            position={{ lat: marker.lat, lng: marker.lng }}
            label={marker.label}
          />
        ))}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
};

export default MapView;
