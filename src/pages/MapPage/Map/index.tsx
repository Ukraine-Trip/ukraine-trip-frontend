import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LayerType = 'grey' | 'satellite' | 'none';

import { MapWrapper } from './style.tsx';
import { createCustomIcon } from './icons.tsx';
import { ZoomHandler } from './ZoomHandler';
import { MarkerPopup } from './MarkerPopup';
import { useVisibleMarkers } from './useVisibleMarkers';
import { MapController } from './MapController';
import Routing from './Routing';
import type { ItineraryPoint } from '../../../types/types.ts';
import { optimizeRoute } from '../../../utils/routeOptimizer';

const HEADER_H = 80; // px — висота фіксованого хедера
const CTRL_TOP = HEADER_H + 12; // відступ контролів від верху

const createClusterCustomIcon = (cluster: any) => {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(33, 33, true),
  });
};

const layerConfig: Record<'grey' | 'satellite', { url: string; attribution: string; maxZoom: number }> = {
  grey: {
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    attribution: '&copy; Stadia Maps',
    maxZoom: 20,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
};

export const MapComponent: React.FC<{ itinerary?: ItineraryPoint[] }> = ({
  itinerary = [],
}) => {
  const [zoom, setZoom] = useState(6);
  const [isOptimized, setIsOptimized] = useState(false);
  const [activeLayer, setActiveLayer] = useState<LayerType>('grey');
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const zoomParam = searchParams.get('zoom');

  const urlCenter: [number, number] | null =
    latParam && lngParam ? [parseFloat(latParam), parseFloat(lngParam)] : null;
  const urlZoom = zoomParam ? parseInt(zoomParam) : undefined;

  const testData: ItineraryPoint[] = [
    { id: '1', name: 'Київ',            category: 'city',     priority: 1, lat: 50.45, lng: 30.52, description: 'Старт' },
    { id: '2', name: 'Львів',           category: 'city',     priority: 1, lat: 49.83, lng: 24.02, description: 'Захід' },
    { id: '3', name: 'Чернігів',        category: 'city',     priority: 2, lat: 51.49, lng: 31.28, description: 'Північ' },
    { id: '4', name: 'Івано-Франківськ',category: 'city',     priority: 2, lat: 48.92, lng: 24.71, description: 'Гори' },
    { id: '5', name: 'Одеса',           category: 'city',     priority: 3, lat: 46.48, lng: 30.72, description: 'Море' },
    { id: '6', name: 'Умань',           category: 'landmark', priority: 3, lat: 48.74, lng: 30.22, description: 'Центр' },
  ];

  const activeData = itinerary.length > 0 ? itinerary : testData;

  const sortedData = useMemo(() => {
    if (isOptimized && activeData.length > 2) return optimizeRoute(activeData);
    return activeData;
  }, [activeData, isOptimized]);

  const polylinePositions = useMemo(
    () => sortedData.map((p) => [p.lat, p.lng] as [number, number]),
    [sortedData],
  );

  useVisibleMarkers(activeData, zoom);


  return (
    <MapWrapper
      style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
    >
      {/* ── ПЕРЕМИКАЧ МАРШРУТУ ── */}
      <div
        onClick={() => setIsOptimized(!isOptimized)}
        style={{
          position: 'absolute',
          top: CTRL_TOP,
          right: '16px',
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

      {/* ── КНОПКА ШАРІВ ── */}
      <div
        onClick={() => setLayerPanelOpen(!layerPanelOpen)}
        title="Базові шари"
        style={{
          position: 'absolute',
          top: CTRL_TOP,
          left: '16px',
          zIndex: 9999,
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: layerPanelOpen ? '1.5px solid #3b5bdb' : '1px solid #e8e8e8',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>

      {/* ── ПАНЕЛЬ ШАРІВ ── */}
      {layerPanelOpen && (
        <div
          style={{
            position: 'absolute',
            top: CTRL_TOP,
            left: '68px',
            zIndex: 9999,
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: '20px',
            width: '280px',
            fontFamily: 'inherit',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e', letterSpacing: 0.2 }}>
              Базові шари
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setLayerPanelOpen(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '20px', lineHeight: 1, padding: '2px 6px', borderRadius: '6px' }}
            >
              ×
            </button>
          </div>

          <div style={{ height: '1px', background: '#f0f0f0', marginBottom: '14px' }} />

          {/* Сіра карта */}
          <div
            onClick={() => { setActiveLayer('grey'); setLayerPanelOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px',
              borderRadius: '10px', cursor: 'pointer', marginBottom: '8px',
              backgroundColor: activeLayer === 'grey' ? '#e8f0fe' : 'transparent',
              border: activeLayer === 'grey' ? '1.5px solid #3b5bdb' : '1.5px solid transparent',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid #ddd' }}>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#efefef 0%,#e0e0e0 40%,#d8d8d8 60%,#e8e8e8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" fill="#e8e8e8"/>
                  <path d="M4 12 Q12 8 20 14 Q28 20 28 24" stroke="#ccc" strokeWidth="1.5" fill="none"/>
                  <path d="M4 20 Q10 16 18 18 Q24 20 28 18" stroke="#ccc" strokeWidth="1" fill="none"/>
                  <rect x="6" y="6" width="8" height="5" rx="1" fill="#ddd"/>
                  <rect x="18" y="14" width="6" height="4" rx="1" fill="#ddd"/>
                </svg>
              </div>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: activeLayer === 'grey' ? '#3b5bdb' : '#222' }}>
              Сіра карта
            </span>
          </div>

          {/* Супутник */}
          <div
            onClick={() => { setActiveLayer('satellite'); setLayerPanelOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px',
              borderRadius: '10px', cursor: 'pointer', marginBottom: '4px',
              backgroundColor: activeLayer === 'satellite' ? '#e8f0fe' : 'transparent',
              border: activeLayer === 'satellite' ? '1.5px solid #3b5bdb' : '1.5px solid transparent',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid #bbb' }}>
              <div style={{
                width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg,#4a6741 0%,#3d5c36 25%,#5a7a4a 40%,#6b8c5b 55%,#4e6645 70%,#3a5530 85%,#567048 100%)',
              }}>
                <div style={{ position: 'absolute', top: '30%', left: '20%', width: '18px', height: '10px', borderRadius: '3px', background: 'rgba(90,120,80,0.6)', transform: 'rotate(-15deg)' }} />
                <div style={{ position: 'absolute', top: '55%', left: '50%', width: '14px', height: '8px', borderRadius: '2px', background: 'rgba(60,90,50,0.7)', transform: 'rotate(10deg)' }} />
                <div style={{ position: 'absolute', top: '15%', right: '15%', width: '10px', height: '6px', borderRadius: '2px', background: 'rgba(120,160,100,0.5)' }} />
              </div>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: activeLayer === 'satellite' ? '#3b5bdb' : '#222' }}>
              Ortophoto 1:10K
            </span>
          </div>

          <div style={{ height: '1px', background: '#f0f0f0', margin: '12px 0' }} />

          {/* Приховати шар */}
          <div
            onClick={() => { setActiveLayer('none'); setLayerPanelOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
              borderRadius: '10px', cursor: 'pointer',
              backgroundColor: activeLayer === 'none' ? '#e8f0fe' : 'transparent',
              transition: 'background 0.15s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <span style={{ fontSize: '14px', fontWeight: 500, color: activeLayer === 'none' ? '#3b5bdb' : '#555' }}>
              Приховати шар
            </span>
          </div>
        </div>
      )}

      {/* ── КАРТА ── */}
      <MapContainer
        center={[48.3794, 31.1656]}
        zoom={6}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Базовий шар */}
        {activeLayer !== 'none' && (
          <TileLayer
            key={activeLayer}
            url={layerConfig[activeLayer].url}
            attribution={layerConfig[activeLayer].attribution}
            maxZoom={layerConfig[activeLayer].maxZoom}
          />
        )}

        {/* Назви міст та доріг поверх супутника */}
        {activeLayer === 'satellite' && (
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png"
            attribution=""
            opacity={0.7}
            maxZoom={18}
          />
        )}

<ZoomHandler setZoom={setZoom} />
        <MapController center={urlCenter} zoom={urlZoom} />

        {polylinePositions.length >= 2 && (
          <Routing
            key={isOptimized ? 'smart' : 'manual'}
            points={polylinePositions}
          />
        )}

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={25}
          iconCreateFunction={createClusterCustomIcon}
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
