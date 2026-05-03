import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet'; // Імпортуємо Leaflet для створення іконок
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

// Функція для створення красивого кластера (кола з цифрою)
const createClusterCustomIcon = (cluster: any) => {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'custom-cluster-icon', // Клас, який ми описали в style.tsx
    iconSize: L.point(33, 33, true),
  });
};

export const MapComponent: React.FC<{ itinerary?: ItineraryPoint[] }> = ({
  itinerary = [],
}) => {
  const [zoom, setZoom] = useState(6);
  const [isOptimized, setIsOptimized] = useState(false);
  const [searchParams] = useSearchParams();

  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const urlCenter: [number, number] | null =
    latParam && lngParam ? [parseFloat(latParam), parseFloat(lngParam)] : null;

  const testData: ItineraryPoint[] = [
    {
      id: '1',
      name: 'Київ',
      category: 'city',
      priority: 1,
      lat: 50.45,
      lng: 30.52,
      description: 'Старт',
    },
    {
      id: '2',
      name: 'Львів',
      category: 'city',
      priority: 1,
      lat: 49.83,
      lng: 24.02,
      description: 'Захід',
    },
    {
      id: '3',
      name: 'Чернігів',
      category: 'city',
      priority: 2,
      lat: 51.49,
      lng: 31.28,
      description: 'Північ',
    },
    {
      id: '4',
      name: 'Івано-Франківськ',
      category: 'city',
      priority: 2,
      lat: 48.92,
      lng: 24.71,
      description: 'Гори',
    },
    {
      id: '5',
      name: 'Одеса',
      category: 'city',
      priority: 3,
      lat: 46.48,
      lng: 30.72,
      description: 'Море',
    },
    {
      id: '6',
      name: 'Умань',
      category: 'landmark',
      priority: 3,
      lat: 48.74,
      lng: 30.22,
      description: 'Центр',
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
    <MapWrapper
      style={{
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      {/* ПЕРЕМИКАЧ МАРШРУТУ */}
      <div
        onClick={() => setIsOptimized(!isOptimized)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: 'white',
          padding: '10px 16px',
          borderRadius: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          border: '1px solid #eee',
        }}
      >
        <input
          type="checkbox"
          checked={isOptimized}
          readOnly
          style={{ cursor: 'pointer', transform: 'scale(1.2)', margin: 0 }}
        />
        <span style={{ fontWeight: 800, fontSize: '12px', color: '#111' }}>
          {isOptimized ? '🚀 SMART ROUTE' : '📍 MY ORDER'}
        </span>
      </div>

      <MapContainer
        center={[48.3794, 31.1656]}
        zoom={6}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          attribution="&copy; Stadia Maps"
        />
        <ZoomHandler setZoom={setZoom} />
        <MapController center={urlCenter} />

        {polylinePositions.length >= 2 && (
          <Routing
            key={isOptimized ? 'smart' : 'manual'}
            points={polylinePositions}
          />
        )}

        {/* НАЛАШТОВАНИЙ КЛАСТЕР */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={25} // Радіус злипання (менше число = менше злипання)
          iconCreateFunction={createClusterCustomIcon} // ПІДКЛЮЧАЄМО НАШУ ФУНКЦІЮ СЮДИ
        >
          {activeData.map((point) => (
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
