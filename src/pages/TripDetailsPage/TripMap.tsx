import React, { useMemo, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, CircularProgress } from '@mui/material';
import type { Trip } from '../../types/types';
import Routing from '../MapPage/Map/component/Routing';

type TransportType = 'car' | 'foot' | 'bike';

const createCustomIcon = (color: string = '#1a1a2e', index: number, total: number) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const bg = isFirst ? '#2e7d5a' : isLast ? '#c0392b' : '#1a1a2e';

  return L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${bg};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        font-weight: bold;
        color: white;
        font-size: 12px;
      ">${index + 1}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    className: 'custom-div-icon',
  });
};

interface TripMapProps {
  trip: Trip;
  loading?: boolean;
  transportType?: TransportType;
}

export const TripMap: React.FC<TripMapProps> = ({
  trip,
  loading = false,
  transportType = 'car',
}) => {
  const mapRef = useRef<any>(null);
  const [selectedTransport, setSelectedTransport] = useState<TransportType>(transportType);

  const sortedNodes = useMemo(() => {
    return [...trip.trip_nodes].sort((a, b) => a.order_index - b.order_index);
  }, [trip.trip_nodes]);

  const routeCoordinates = useMemo((): [number, number][] => {
    return sortedNodes
      .filter((n) => n.location?.lat != null && n.location?.lon != null)
      .map((n) => [n.location!.lat, n.location!.lon] as [number, number]);
  }, [sortedNodes]);

  const center = useMemo((): [number, number] => {
    if (routeCoordinates.length === 0) return [48.3794, 31.1656];
    const avgLat =
      routeCoordinates.reduce((sum, c) => sum + c[0], 0) / routeCoordinates.length;
    const avgLng =
      routeCoordinates.reduce((sum, c) => sum + c[1], 0) / routeCoordinates.length;
    return [avgLat, avgLng];
  }, [routeCoordinates]);

  const zoom = useMemo(() => {
    if (routeCoordinates.length === 0) return 6;
    if (routeCoordinates.length === 1) return 12;
    const lats = routeCoordinates.map((c) => c[0]);
    const lngs = routeCoordinates.map((c) => c[1]);
    const maxDiff = Math.max(
      Math.max(...lats) - Math.min(...lats),
      Math.max(...lngs) - Math.min(...lngs)
    );
    if (maxDiff > 10) return 6;
    if (maxDiff > 5) return 7;
    if (maxDiff > 2) return 8;
    if (maxDiff > 1) return 9;
    if (maxDiff > 0.5) return 10;
    return 11;
  }, [routeCoordinates]);

  useEffect(() => {
    if (mapRef.current && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates.map((c) => [c[0], c[1]]));
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

  const transportOptions: { type: TransportType; label: string }[] = [
    { type: 'car', label: '🚗' },
    { type: 'bike', label: '🚲' },
    { type: 'foot', label: '🚶' },
  ];

  return (
    <Box sx={{ width: '100%', borderRadius: 1, overflow: 'hidden', boxShadow: 1, position: 'relative' }}>
      {/* Transport selector */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          border: '1px solid #e8e8e8',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          width: '44px',
        }}
      >
        {transportOptions.map(({ type, label }, i) => (
          <React.Fragment key={type}>
            {i > 0 && <Box sx={{ height: '1px', background: '#f0f0f0' }} />}
            <button
              onClick={() => setSelectedTransport(type)}
              title={type === 'car' ? 'Автомобіль' : type === 'bike' ? 'Велосипед' : 'Пішки'}
              style={{
                background: selectedTransport === type ? '#000' : 'transparent',
                color: selectedTransport === type ? 'white' : '#666',
                border: 'none',
                padding: '9px 0 7px',
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                transition: 'background 0.2s, color 0.2s',
                fontSize: '16px',
              }}
            >
              {label}
              <span
                style={{
                  fontSize: '8px',
                  fontWeight: 700,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                {type}
              </span>
            </button>
          </React.Fragment>
        ))}
      </Box>

      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ height: '420px', width: '100%' }}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          attribution="&copy; Stadia Maps"
          maxZoom={20}
        />

        {routeCoordinates.length > 1 && (
          <Routing points={routeCoordinates} transportType={selectedTransport} />
        )}

        {sortedNodes.map((node, index) =>
          node.location?.lat != null && node.location?.lon != null ? (
            <Marker
              key={node.id}
              position={[node.location.lat, node.location.lon]}
              icon={createCustomIcon('#1a1a2e', index, sortedNodes.length)}
            >
              <Popup>
                <div style={{ minWidth: '220px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                    {index + 1}. {node.location.name || 'Без назви'}
                  </div>
                  {node.location.region && (
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      {node.location.region}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#aaa' }}>
                    {node.location.lat.toFixed(4)}, {node.location.lon.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </Box>
  );
};
