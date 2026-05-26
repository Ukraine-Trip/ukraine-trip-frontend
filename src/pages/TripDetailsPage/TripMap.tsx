import React, { useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, CircularProgress } from '@mui/material';
import type { Trip } from '../../types/types';
const Routing = lazy(() => import('../MapPage/Map/component/Routing'));

type TransportType = 'car' | 'foot' | 'bike';

const createCustomIcon = (color: string = '#1a1a2e', index: number, total: number) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const bg = isFirst ? '#2e7d5a' : isLast ? '#c0392b' : color;

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

const TripMapComponent: React.FC<TripMapProps> = ({
  trip,
  loading = false,
  transportType = 'car',
}) => {
  const mapRef = useRef<any>(null);
  const selectedTransport: TransportType = transportType;
  const sortedNodes = useMemo(() => {
    return [...trip.trip_nodes].sort((a, b) => a.order_index - b.order_index);
  }, [trip.trip_nodes]);

  const routeCoordinates = useMemo((): [number, number][] => {
    return sortedNodes
      .filter((n) => n.location?.lat != null && n.location?.lon != null)
      .map((n) => [n.location!.lat, n.location!.lon] as [number, number]);
  }, [sortedNodes]);

  // Prefer backend-provided route geometry if available (GeoJSON coords are [lon, lat])
  const backendRaw = (trip as any)?.route_geometry?.coordinates;
  const routingPoints = useMemo((): [number, number][] => {
    if (Array.isArray(backendRaw) && backendRaw.length > 1) {
      try {
        return backendRaw.map((c: any) => [c[1], c[0]] as [number, number]);
      } catch {
        return routeCoordinates;
      }
    }
    return routeCoordinates;
  }, [backendRaw, routeCoordinates]);

  const center = useMemo((): [number, number] => {
    if (routingPoints.length === 0) return [48.3794, 31.1656];
    const avgLat =
      routingPoints.reduce((sum, c) => sum + c[0], 0) / routingPoints.length;
    const avgLng =
      routingPoints.reduce((sum, c) => sum + c[1], 0) / routingPoints.length;
    return [avgLat, avgLng];
  }, [routingPoints]);

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

  // Memoize icon creation per node to avoid recreating on every render
  const nodeIcons = useMemo(() => {
    return sortedNodes.map((_, index) =>
      createCustomIcon('#1a1a2e', index, sortedNodes.length)
    );
  }, [sortedNodes]);

  useEffect(() => {
    if (mapRef.current && routingPoints.length > 0) {
      const bounds = L.latLngBounds(routingPoints.map((c) => [c[0], c[1]]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [routingPoints]);

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

  // const transportOptions: { type: TransportType; label: string }[] = [
  //   { type: 'car', label: '🚗' },
  //   { type: 'bike', label: '🚲' },
  //   { type: 'foot', label: '🚶' },
  // ];
const blueOptions = { color: '#2A6FD9', weight: 5, opacity: 0.8 };
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

        {routingPoints.length > 1 && (
          <Suspense fallback={null}>
            <Routing points={routingPoints} transportType={selectedTransport} />
          </Suspense>
        )}

        {sortedNodes.map((node, index) =>
          node.location?.lat != null && node.location?.lon != null ? (
            <Marker
              key={node.id}
              position={[node.location.lat, node.location.lon]}
              icon={nodeIcons[index]}
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

export const TripMap = React.memo(TripMapComponent, (prevProps, nextProps) => {
  // Return true if props are equal (don't re-render), false if different (re-render)
  return (
    prevProps.trip.id === nextProps.trip.id &&
    prevProps.loading === nextProps.loading &&
    prevProps.transportType === nextProps.transportType
  );
});
