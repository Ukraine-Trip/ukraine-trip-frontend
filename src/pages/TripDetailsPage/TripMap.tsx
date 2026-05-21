import React, { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, CircularProgress } from '@mui/material';
import type { Trip } from '../../types/types';

const createCustomIcon = (color: string = '#007AFF') => {
  return L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        font-weight: bold;
        color: white;
        font-size: 12px;
      "></div>
    `,
    iconSize: [32, 32],
    className: 'custom-div-icon',
  });
};

interface TripMapProps {
  trip: Trip;
  loading?: boolean;
}

export const TripMap: React.FC<TripMapProps> = ({ trip, loading = false }) => {
  const mapRef = useRef<any>(null);

  const sortedNodes = useMemo(() => {
    return [...trip.trip_nodes].sort((a, b) => a.order_index - b.order_index);
  }, [trip.trip_nodes]);

  const routeCoordinates = useMemo(() => {
    return sortedNodes
      .filter((n) => n.location?.lat != null && n.location?.lon != null)
      .map((n) => [n.location!.lat, n.location!.lon] as [number, number]);
  }, [sortedNodes]);

  const center = useMemo(() => {
    if (routeCoordinates.length === 0) return [48.3794, 31.1656] as [number, number];
    const avgLat =
      routeCoordinates.reduce((sum, coord) => sum + coord[0], 0) /
      routeCoordinates.length;
    const avgLng =
      routeCoordinates.reduce((sum, coord) => sum + coord[1], 0) /
      routeCoordinates.length;
    return [avgLat, avgLng] as [number, number];
  }, [routeCoordinates]);

  const zoom = useMemo(() => {
    if (routeCoordinates.length === 0) return 6;
    if (routeCoordinates.length === 1) return 12;
    
    const lats = routeCoordinates.map((c) => c[0]);
    const lngs = routeCoordinates.map((c) => c[1]);
    const latDiff = Math.max(...lats) - Math.min(...lats);
    const lngDiff = Math.max(...lngs) - Math.min(...lngs);
    const maxDiff = Math.max(latDiff, lngDiff);

    if (maxDiff > 10) return 6;
    if (maxDiff > 5) return 7;
    if (maxDiff > 2) return 8;
    if (maxDiff > 1) return 9;
    if (maxDiff > 0.5) return 10;
    return 11;
  }, [routeCoordinates]);

  useEffect(() => {
    if (mapRef.current && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(
        routeCoordinates.map((c) => [c[0], c[1]])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [routeCoordinates]);

  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          borderRadius: 1,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', borderRadius: 1, overflow: 'hidden', boxShadow: 1 }}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          attribution='&copy; Stadia Maps'
          maxZoom={20}
        />

        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#007AFF"
            weight={3}
            opacity={0.7}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {sortedNodes.map((node, index) => (
          node.location?.lat != null &&
          node.location?.lon != null && (
            <Marker
              key={node.id}
              position={[node.location.lat, node.location.lon]}
              icon={createCustomIcon('#007AFF')}
            >
              <Popup>
                <div style={{ minWidth: '250px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                    {index + 1}. {node.location.name || 'Без назви'}
                  </div>
                  {node.location.region && (
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      Регіон: {node.location.region}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    Координати: {node.location.lat.toFixed(4)}, {node.location.lon.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </Box>
  );
};
