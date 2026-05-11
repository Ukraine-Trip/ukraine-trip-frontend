import React, { useState, useMemo, useEffect, useContext, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../../api/auth.ts';
import { AuthContext } from '../../../context/AuthContext.tsx';

type LayerType = 'grey' | 'satellite' | 'none';

import { MapWrapper, MapPageLayout, RouteSidebar, MapArea } from './style.tsx';
import { createCustomIcon } from './icons.tsx';
import { ZoomHandler } from './component/ZoomHandler.tsx';
import { MarkerPopup } from './component/MarkerPopup.tsx';
import { useVisibleMarkers } from './useVisibleMarkers.ts';
import { MapController } from './component/MapController.tsx';
import Routing from './component/Routing.tsx';
import { UserLocation } from './component/UserLocation.tsx';
import type { ItineraryPoint } from '../../../types/types.ts';
import { optimizeRoute } from '../../../utils/routeOptimizer';

const HEADER_H = 80;
const CTRL_TOP = HEADER_H + 12;

interface TripMeta {
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  waypoints: Array<{ name: string; order_index: number }>;
}

const RouteBoundsController: React.FC<{ points: [number, number][] }> = ({
  points,
}) => {
  const map = useMap();
  const prevPointsRef = useRef<string>('');

  useEffect(() => {
    if (points.length < 2) return;
    const key = JSON.stringify(points);
    if (key === prevPointsRef.current) return;
    prevPointsRef.current = key;
    map.fitBounds(
      L.latLngBounds(points.map(([lat, lng]) => L.latLng(lat, lng))),
      { padding: [60, 60] }
    );
  }, [map, points]);

  return null;
};

const createClusterCustomIcon = (cluster: any) => {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(33, 33, true),
  });
};

const layerConfig: Record<
  'grey' | 'satellite',
  { url: string; attribution: string; maxZoom: number }
> = {
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

const formatDate = (start: string | null, end: string | null): string => {
  if (!start) return '';
  const fmt = (d: Date) =>
    d.toLocaleString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  const s = new Date(start);
  if (!end || start === end) return fmt(s);
  return `${fmt(s)} — ${fmt(new Date(end))}`;
};

type TransportType = 'car' | 'foot' | 'bike';

export const MapComponent: React.FC<{ itinerary?: ItineraryPoint[] }> = ({
  itinerary = [],
}) => {
  const { token } = useContext(AuthContext);
  const [zoom, setZoom] = useState(6);
  const [isOptimized, setIsOptimized] = useState(false);
  const [activeLayer, setActiveLayer] = useState<LayerType>('grey');
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [routePanelOpen, setRoutePanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const navLocation = useLocation();
  const navigate = useNavigate();

  const [selectedPoints, setSelectedPoints] = useState<ItineraryPoint[]>([]);
  const [transportType, setTransportType] = useState<TransportType>('car');

  const handleSelectPoint = (point: ItineraryPoint) => {
    setSelectedPoints((prev) => {
      const isSelected = prev.find((p) => p.id === point.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== point.id);
      } else {
        return [...prev, point];
      }
    });
  };

  const isPointSelected = (point: ItineraryPoint) => {
    return selectedPoints.some((p) => p.id === point.id);
  };

  const stateRoutePoints: [number, number][] | undefined = (
    navLocation.state as any
  )?.routePoints;
  const tripMeta: TripMeta | undefined = (navLocation.state as any)?.tripMeta;

  const [apiLocations, setApiLocations] = useState<ItineraryPoint[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const publicReq = api.get('/locations/');
        const myReq = token
          ? api.get('/locations/my', {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null);

        const [publicResult, myResult] = await Promise.allSettled([
          publicReq,
          myReq,
        ]);

        let publicLocations: ItineraryPoint[] = [];
        if (publicResult.status === 'fulfilled' && publicResult.value) {
          publicLocations = publicResult.value.data.map((loc: any) => ({
            id: String(loc.id),
            name: loc.name,
            category: loc.type ?? 'landmark',
            priority: loc.priority ?? 3,
            description: loc.description ?? '',
            lat: loc.lat,
            lng: loc.lon,
          }));
        } else {
          console.error(
            'Не вдалось завантажити публічні локації:',
            publicResult.reason
          );
        }

        let myLocations: ItineraryPoint[] = [];
        if (myResult.status === 'fulfilled' && myResult.value) {
          myLocations = myResult.value.data
            .filter((loc: any) => !loc.is_approved)
            .map((loc: any) => ({
              id: String(loc.id),
              name: loc.name,
              category: loc.type ?? 'landmark',
              priority: loc.priority ?? 3,
              description: loc.description ?? '',
              lat: loc.lat,
              lng: loc.lon,
            }));
        } else if (myResult.status === 'rejected') {
          if (myResult.reason?.response?.status !== 401) {
            console.error(
              'Не вдалось завантажити приватні локації:',
              myResult.reason
            );
          }
        }

        setApiLocations([...publicLocations, ...myLocations]);
      } catch (err) {
        console.error('Не вдалось завантажити локації:', err);
      }
    };
    fetchLocations();
  }, [token]);

  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const zoomParam = searchParams.get('zoom');

  const urlCenter: [number, number] | null =
    latParam && lngParam ? [parseFloat(latParam), parseFloat(lngParam)] : null;
  const urlZoom = zoomParam ? parseInt(zoomParam) : undefined;

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

  const activeData =
    itinerary.length > 0
      ? itinerary
      : apiLocations.length > 0
        ? apiLocations
        : testData;

  const polylinePositions = useMemo<[number, number][]>(() => {
    if (stateRoutePoints && stateRoutePoints.length >= 2)
      return stateRoutePoints;
    return activeData.map((p) => [p.lat, p.lng] as [number, number]);
  }, [stateRoutePoints, activeData]);

  const routePoints = useMemo(() => {
    if (isOptimized && selectedPoints.length > 2) {
      return optimizeRoute(selectedPoints);
    }
    return selectedPoints;
  }, [selectedPoints, isOptimized]);

  const routePolyline = useMemo<[number, number][]>(() => {
    return routePoints.map((p) => [p.lat, p.lng] as [number, number]);
  }, [routePoints]);

  useVisibleMarkers(activeData, zoom);

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
      <MapPageLayout>
        <RouteSidebar $collapsed={!sidebarOpen}>
          <div style={{ padding: '16px 20px 0' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#555',
                fontSize: '13px',
                fontWeight: 600,
                padding: '6px 0',
                letterSpacing: '0.3px',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              BACK
            </button>
          </div>

          {tripMeta ? (
            <div style={{ padding: '12px 20px 24px', flex: 1 }}>
              <h1
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#1a1a2e',
                  margin: '0 0 8px',
                  lineHeight: 1.2,
                  letterSpacing: '-0.3px',
                }}
              >
                {tripMeta.title}
              </h1>

              {(tripMeta.start_date || tripMeta.end_date) && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f0f4ff',
                    border: '1px solid #d0daff',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    color: '#3b5bdb',
                    fontWeight: 600,
                    marginBottom: '16px',
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatDate(tripMeta.start_date, tripMeta.end_date)}
                </div>
              )}

              {tripMeta.description && (
                <p
                  style={{
                    fontSize: '14px',
                    color: '#555',
                    lineHeight: 1.6,
                    margin: '0 0 20px',
                  }}
                >
                  {tripMeta.description}
                </p>
              )}

              {tripMeta.waypoints.length > 0 && (
                <>
                  <div
                    style={{
                      height: '1px',
                      background: '#ebebeb',
                      margin: '0 0 16px',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#999',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: '12px',
                    }}
                  >
                    Route · {tripMeta.waypoints.length} stops
                  </div>

                  <ol
                    style={{
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    {tripMeta.waypoints.map((wp, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background:
                            i === 0
                              ? '#f0f7f4'
                              : i === tripMeta.waypoints.length - 1
                                ? '#f7f0f0'
                                : 'transparent',
                        }}
                      >
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background:
                              i === 0
                                ? '#2e7d5a'
                                : i === tripMeta.waypoints.length - 1
                                  ? '#c0392b'
                                  : '#e8e8e8',
                            color:
                              i === 0 || i === tripMeta.waypoints.length - 1
                                ? '#fff'
                                : '#555',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            color: '#222',
                            fontWeight: 500,
                          }}
                        >
                          {wp.name}
                        </span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 24px',
                textAlign: 'center',
                color: '#bbb',
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ddd"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: '16px' }}
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                Select a route from the
                <br />
                home page to see details
              </p>
            </div>
          )}
        </RouteSidebar>

        <MapArea>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? 'Сховати маршрут' : 'Показати маршрут'}
            style={{
              position: 'absolute',
              top: CTRL_TOP,
              left: 0,
              zIndex: 999,
              background: 'white',
              border: '1px solid #e8e8e8',
              borderLeft: 'none',
              borderRadius: '0 8px 8px 0',
              width: '20px',
              height: '44px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="#555"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'transform 0.3s',
                transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            >
              <polyline points="7,1 3,5 7,9" />
            </svg>
          </button>

          {selectedPoints.length > 2 && (
            <div
              onClick={() => setIsOptimized(!isOptimized)}
              style={{
                position: 'absolute',
                top: CTRL_TOP,
                right: '16px',
                zIndex: 999,
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
                style={{
                  cursor: 'pointer',
                  transform: 'scale(1.2)',
                  margin: 0,
                }}
              />
              <span
                style={{ fontWeight: 800, fontSize: '12px', color: '#111' }}
              >
                {isOptimized ? '🚀 SMART ROUTE' : '📍 MY ORDER'}
              </span>
            </div>
          )}

          <div
            onClick={() => {
              setLayerPanelOpen(!layerPanelOpen);
              setRoutePanelOpen(false);
            }}
            title="Базові шари"
            style={{
              position: 'absolute',
              top: CTRL_TOP + 52,
              right: '16px',
              zIndex: 999,
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: layerPanelOpen
                ? '1.5px solid #3b5bdb'
                : '1px solid #e8e8e8',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>

          <div
            onClick={() => {
              setRoutePanelOpen(!routePanelOpen);
              setLayerPanelOpen(false);
            }}
            title="Обрані точки маршруту"
            style={{
              position: 'absolute',
              top: CTRL_TOP + 52 + 56,
              right: '16px',
              zIndex: 999,
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: routePanelOpen
                ? '1.5px solid #e74c3c'
                : '1px solid #e8e8e8',
              position: 'absolute' as any,
            }}
          >
            <div style={{ position: 'relative' }}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              {selectedPoints.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  {selectedPoints.length}
                </span>
              )}
            </div>
          </div>

          {layerPanelOpen && (
            <div
              style={{
                position: 'absolute',
                top: CTRL_TOP + 52,
                right: '68px',
                zIndex: 999,
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                padding: '20px',
                width: '280px',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '15px',
                    color: '#1a1a2e',
                    letterSpacing: 0.2,
                  }}
                >
                  Базові шари
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayerPanelOpen(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666',
                    fontSize: '20px',
                    lineHeight: 1,
                    padding: '2px 6px',
                    borderRadius: '6px',
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  height: '1px',
                  background: '#f0f0f0',
                  marginBottom: '14px',
                }}
              />

              <div
                onClick={() => {
                  setActiveLayer('grey');
                  setLayerPanelOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  backgroundColor:
                    activeLayer === 'grey' ? '#e8f0fe' : 'transparent',
                  border:
                    activeLayer === 'grey'
                      ? '1.5px solid #3b5bdb'
                      : '1.5px solid transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid #ddd',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background:
                        'linear-gradient(135deg,#efefef 0%,#e0e0e0 40%,#d8d8d8 60%,#e8e8e8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect width="32" height="32" fill="#e8e8e8" />
                      <path
                        d="M4 12 Q12 8 20 14 Q28 20 28 24"
                        stroke="#ccc"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <path
                        d="M4 20 Q10 16 18 18 Q24 20 28 18"
                        stroke="#ccc"
                        strokeWidth="1"
                        fill="none"
                      />
                      <rect
                        x="6"
                        y="6"
                        width="8"
                        height="5"
                        rx="1"
                        fill="#ddd"
                      />
                      <rect
                        x="18"
                        y="14"
                        width="6"
                        height="4"
                        rx="1"
                        fill="#ddd"
                      />
                    </svg>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: activeLayer === 'grey' ? '#3b5bdb' : '#222',
                  }}
                >
                  Сіра карта
                </span>
              </div>

              <div
                onClick={() => {
                  setActiveLayer('satellite');
                  setLayerPanelOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  backgroundColor:
                    activeLayer === 'satellite' ? '#e8f0fe' : 'transparent',
                  border:
                    activeLayer === 'satellite'
                      ? '1.5px solid #3b5bdb'
                      : '1.5px solid transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid #bbb',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      background:
                        'linear-gradient(135deg,#4a6741 0%,#3d5c36 25%,#5a7a4a 40%,#6b8c5b 55%,#4e6645 70%,#3a5530 85%,#567048 100%)',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '30%',
                        left: '20%',
                        width: '18px',
                        height: '10px',
                        borderRadius: '3px',
                        background: 'rgba(90,120,80,0.6)',
                        transform: 'rotate(-15deg)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '55%',
                        left: '50%',
                        width: '14px',
                        height: '8px',
                        borderRadius: '2px',
                        background: 'rgba(60,90,50,0.7)',
                        transform: 'rotate(10deg)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '15%',
                        right: '15%',
                        width: '10px',
                        height: '6px',
                        borderRadius: '2px',
                        background: 'rgba(120,160,100,0.5)',
                      }}
                    />
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: activeLayer === 'satellite' ? '#3b5bdb' : '#222',
                  }}
                >
                  Ortophoto 1:10K
                </span>
              </div>

              <div
                style={{
                  height: '1px',
                  background: '#f0f0f0',
                  margin: '12px 0',
                }}
              />

              <div
                onClick={() => {
                  setActiveLayer('none');
                  setLayerPanelOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  backgroundColor:
                    activeLayer === 'none' ? '#e8f0fe' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: activeLayer === 'none' ? '#3b5bdb' : '#555',
                  }}
                >
                  Приховати шар
                </span>
              </div>
            </div>
          )}

          {routePanelOpen && (
            <div
              style={{
                position: 'absolute',
                top: CTRL_TOP + 52 + 56,
                right: '68px',
                zIndex: 999,
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                padding: '20px',
                width: '320px',
                maxHeight: '60vh',
                overflowY: 'auto',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <span
                  style={{ fontWeight: 800, fontSize: '16px', color: '#111' }}
                >
                  Мій маршрут
                </span>
                <button
                  onClick={() => setRoutePanelOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#666',
                  }}
                >
                  ×
                </button>
              </div>

              {selectedPoints.length === 0 ? (
                <p
                  style={{
                    color: '#888',
                    fontSize: '14px',
                    textAlign: 'center',
                  }}
                >
                  Ви ще не обрали жодної точки. Натисніть на маркер на карті,
                  щоб додати його до маршруту.
                </p>
              ) : (
                <ol
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {routePoints.map((point, index) => (
                    <li
                      key={point.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 'bold',
                            color: '#555',
                            width: '20px',
                          }}
                        >
                          {index + 1}.
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>
                          {point.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSelectPoint(point)}
                        title="Видалити"
                        style={{
                          background: '#ff4757',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              top: CTRL_TOP + 52 + 56 + 56,
              right: '16px',
              zIndex: 999,
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              display: 'flex',
              padding: '4px',
              gap: '4px',
              border: '1px solid #e8e8e8',
            }}
          >
            {(['car', 'bike', 'foot'] as TransportType[]).map((type) => (
              <button
                key={type}
                onClick={() => setTransportType(type)}
                title={type.charAt(0).toUpperCase() + type.slice(1)}
                style={{
                  background:
                    transportType === type ? '#3b5bdb' : 'transparent',
                  color: transportType === type ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                <span
                  style={{
                    textTransform: 'capitalize',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {type}
                </span>
              </button>
            ))}
          </div>

          <MapContainer
            center={[48.3794, 31.1656]}
            zoom={6}
            zoomControl={false}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            {activeLayer !== 'none' && (
              <TileLayer
                key={activeLayer}
                url={layerConfig[activeLayer].url}
                attribution={layerConfig[activeLayer].attribution}
                maxZoom={layerConfig[activeLayer].maxZoom}
              />
            )}
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
            <UserLocation ctrlTop={CTRL_TOP + 52 + 56 + 56 + 56} />

            <RouteBoundsController
              points={
                routePolyline.length > 0 ? routePolyline : polylinePositions
              }
            />
            {routePolyline.length >= 2 && (
              <Routing
                key={`route-${transportType}-${routePoints.map((p) => p.id).join('-')}`}
                points={routePolyline}
                transportType={transportType}
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
                  <MarkerPopup
                    point={point}
                    onSelectPoint={handleSelectPoint}
                    isSelected={isPointSelected(point)}
                  />
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </MapArea>
      </MapPageLayout>
    </MapWrapper>
  );
};
