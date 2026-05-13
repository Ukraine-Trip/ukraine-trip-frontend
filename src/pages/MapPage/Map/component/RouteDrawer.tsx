import React from 'react';
import { Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

interface RouteDrawerProps {
  coordinates: [number, number][];
  color?: string;
  weight?: number;
}

const RouteDrawer: React.FC<RouteDrawerProps> = ({
  coordinates,
  color = '#2A6FD9',
  weight = 5,
}) => {
  const map = useMap();

  React.useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);

  if (!coordinates || coordinates.length < 2) return null;

  return (
    <Polyline
      positions={coordinates}
      pathOptions={{ color, weight, opacity: 0.8 }}
    />
  );
};

export default RouteDrawer;
