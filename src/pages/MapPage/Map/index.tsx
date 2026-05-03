import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';

import { MapWrapper } from './style.tsx';
import { createCustomIcon } from './icons.tsx';
import { ZoomHandler } from './ZoomHandler';
import { MarkerPopup } from './MarkerPopup';
import { useVisibleMarkers } from './useVisibleMarkers';
import { MapController } from './MapController';
import Routing from './Routing';
import type { ItineraryPoint } from '../../../types/types.ts';
import { optimizeRoute } from '../../../utils/routeOptimizer';

export const MapComponent: React.FC<{
  itinerary?: ItineraryPoint[];
  isOptimized?: boolean;
}> = ({ itinerary = [], isOptimized = false }) => {
  const [zoom, setZoom] = useState(6);

  // Використовуємо тестові дані, поки немає БД
  const testData: ItineraryPoint[] = [
    {
      id: '1',
      name: 'Київ',
      category: 'city',
      priority: 1,
      lat: 50.45,
      lng: 30.52,
    },
    {
      id: '2',
      name: 'Львів',
      category: 'city',
      priority: 1,
      lat: 49.83,
      lng: 24.02,
    },
    {
      id: '3',
      name: 'Житомир',
      category: 'city',
      priority: 2,
      lat: 50.25,
      lng: 28.65,
    },
  ];

  const activeData = itinerary.length > 0 ? itinerary : testData;

  const sortedData = useMemo(() => {
    if (isOptimized && activeData.length > 2) return optimizeRoute(activeData);
    return activeData;
  }, [activeData, isOptimized]);

  const polylinePositions = useMemo(() => {
    return sortedData.map((p) => [p.lat, p.lng] as [number, number]);
  }, [sortedData]);

  const visibleMarkers = useVisibleMarkers(activeData, zoom);

  return (
    <MapWrapper style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={[48.3794, 31.1656]}
        zoom={6}
        scrollWheelZoom={true}
        // ВАЖЛИВО: Явна висота поверне мапу на екран
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          attribution="&copy; Stadia Maps"
        />
        <ZoomHandler setZoom={setZoom} />
        <MapController points={polylinePositions} />

        {polylinePositions.length >= 2 && (
          <Routing
            key={JSON.stringify(polylinePositions)}
            points={polylinePositions}
          />
        )}

        <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
          {visibleMarkers.map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={createCustomIcon(point.category)}
            >
              <MarkerPopup point={point} />
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </MapWrapper>
  );
};
