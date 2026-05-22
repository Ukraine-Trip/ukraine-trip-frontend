import React, { useState, useMemo, useEffect, useContext, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../../api/auth.ts';
import { AuthContext } from '../../../context/AuthContext.tsx';
import axios from 'axios';
import { Alert } from '@mui/material';

type LayerType = 'grey' | 'satellite' | 'none';

import { MapWrapper, MapPageLayout, RouteSidebar, MapArea } from './style.tsx';
import { createCustomIcon } from './icons.tsx';
import { ZoomHandler } from './component/ZoomHandler.tsx';
import { MarkerPopup } from './component/MarkerPopup.tsx';
import { useVisibleMarkers } from './useVisibleMarkers.ts';
import { MapController } from './component/MapController.tsx';
import Routing from './component/Routing.tsx';
import { UserLocation } from './component/UserLocation.tsx';
import type { ItineraryPoint, Trip } from '../../../types/types.ts';
import regionsData from '../../../librarian/cities.json';
import { getAllTrips, getMyTrips, createTrip } from '../../../api/trips.ts';

const HEADER_H = 80;
//const CTRL_TOP = HEADER_H + 12;


interface TripMeta {
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  waypoints: Array<{ name: string; order_index: number }>;
}

interface CityMeta {
  name: string;
  lat: number;
  lng: number;
}

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

const DANGEROUS_REGIONS = [
  'Donetsk',
  'Luhansk',
  'Zaporizhzhia',
  'Kherson',
  'Mykolaiv',
  'Kharkiv',
  'Sumy',
  'Kyiv',
  'Chernihiv',
  'Dnipropetrovsk',
  'Odesa',
];

type TransportType = 'car' | 'foot' | 'bike';

export const MapComponent: React.FC<{ itinerary?: ItineraryPoint[] }> = ({
  itinerary = [],
}) => {
  const isMobile = window.innerWidth <= 768; 
  const CTRL_TOP = isMobile ? 16 : HEADER_H + 12;
  const { token } = useContext(AuthContext);
  const [zoom, setZoom] = useState(6);
  const [isOptimized, setIsOptimized] = useState(false);
  const originalRoutePointsRef = useRef<ItineraryPoint[]>([]);
  const [activeLayer, setActiveLayer] = useState<LayerType>('grey');
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const navLocation = useLocation();
  const navigate = useNavigate();

  const [selectedRoutePoints, setSelectedRoutePoints] = useState<
    ItineraryPoint[]
  >([]);
  const [transportType, setTransportType] = useState<TransportType>('car');
  const [activePointDetails, setActivePointDetails] =
    useState<ItineraryPoint | null>(null);
  const [cityTrips, setCityTrips] = useState<Trip[]>([]);
  const [myCityTrips, setMyCityTrips] = useState<Trip[]>([]);
  const [routeSource, setRouteSource] = useState<'provided' | 'my'>('provided');
  const [cityTripsLoading, setCityTripsLoading] = useState(false);
  const [selectedCityTrip, setSelectedCityTrip] = useState<Trip | null>(null);
  const [routeBuildingMode, setRouteBuildingMode] = useState(false);
  const [saveMode, setSaveMode] = useState(false);
  const [tripTitle, setTripTitle] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fetchedTripRoute, setFetchedTripRoute] = useState<[number, number][]>(
    []
  );
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const [mapDraggingIdx, setMapDraggingIdx] = useState<number | null>(null);
  const [mapDragOverIdx, setMapDragOverIdx] = useState<number | null>(null);
  const mapDragNodeRef = useRef<number | null>(null);

  const handleMapDragStart = (idx: number) => {
    mapDragNodeRef.current = idx;
    setMapDraggingIdx(idx);
  };
  const handleMapDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (mapDragNodeRef.current !== null && mapDragNodeRef.current !== idx)
      setMapDragOverIdx(idx);
  };
  const handleMapDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = mapDragNodeRef.current;
    if (fromIdx !== null && fromIdx !== toIdx) {
      setSelectedRoutePoints((prev) => {
        const u = [...prev];
        const [m] = u.splice(fromIdx, 1);
        u.splice(toIdx, 0, m);
        return u;
      });
    }
    mapDragNodeRef.current = null;
    setMapDraggingIdx(null);
    setMapDragOverIdx(null);
  };
  const handleMapDragEnd = () => {
    mapDragNodeRef.current = null;
    setMapDraggingIdx(null);
    setMapDragOverIdx(null);
  };
  const handleMapTouchStart = (idx: number) => {
    mapDragNodeRef.current = idx;
    setMapDraggingIdx(idx);
  };
  const handleMapTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const item = el?.closest('[data-map-route-idx]') as HTMLElement | null;
    if (!item) return;
    const idx = parseInt(item.dataset.mapRouteIdx ?? '-1', 10);
    if (!isNaN(idx) && idx !== mapDragNodeRef.current) setMapDragOverIdx(idx);
  };
  const handleMapTouchEnd = () => {
    const fromIdx = mapDragNodeRef.current;
    setSelectedRoutePoints((prev) => {
      if (fromIdx === null || mapDragOverIdx === null || fromIdx === mapDragOverIdx) return prev;
      const u = [...prev];
      const [m] = u.splice(fromIdx, 1);
      u.splice(mapDragOverIdx, 0, m);
      return u;
    });
    mapDragNodeRef.current = null;
    setMapDraggingIdx(null);
    setMapDragOverIdx(null);
  };

  useEffect(() => {
    const state = navLocation.state as any;
    if (state?.initialRoutePoints && Array.isArray(state.initialRoutePoints)) {
      setSelectedRoutePoints(state.initialRoutePoints);
    }
    if (state?.transport) {
      setTransportType(state.transport);
    }

    if (state?.tripId) {
      const fetchTrip = async () => {
        setIsRouteLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:8000/api/v1/trips/${state.tripId}`
          );
          if (response.data && response.data.trip_nodes) {
            const sortedNodes = [...response.data.trip_nodes].sort(
              (a, b) => a.order_index - b.order_index
            );
            const coords: [number, number][] = sortedNodes
              .map((node: any) => {
                if (
                  node.location &&
                  node.location.lat != null &&
                  node.location.lon != null
                ) {
                  return [node.location.lat, node.location.lon] as [
                    number,
                    number,
                  ];
                }
                return null;
              })
              .filter((coord: any) => coord !== null) as [number, number][];
            setFetchedTripRoute(coords);
          }
        } catch (error) {
          console.error('Failed to fetch trip details:', error);
        } finally {
          setIsRouteLoading(false);
        }
      };
      fetchTrip();
    }
  }, [navLocation.state]);

  const handleSelectPoint = (point: ItineraryPoint) => {
    if (isOptimized) {
      const base =
        originalRoutePointsRef.current.length > 0
          ? originalRoutePointsRef.current
          : selectedRoutePoints;
      const isSelected = base.some((p) => p.id === point.id);
      setSelectedRoutePoints(
        isSelected ? base.filter((p) => p.id !== point.id) : [...base, point]
      );
      originalRoutePointsRef.current = [];
      setIsOptimized(false);
    } else {
      setSelectedRoutePoints((prev) => {
        const isSelected = prev.find((p) => p.id === point.id);
        if (isSelected) return prev.filter((p) => p.id !== point.id);
        return [...prev, point];
      });
    }
    setActivePointDetails(point);
  };

  const isPointSelected = (point: ItineraryPoint) => {
    return selectedRoutePoints.some((p) => p.id === point.id);
  };

  const nearestNeighborSort = (points: ItineraryPoint[]): ItineraryPoint[] => {
    if (points.length <= 2) return [...points];

    const unvisited = points.slice(1);
    const result: ItineraryPoint[] = [points[0]];

    while (unvisited.length > 0) {
      const current = result[result.length - 1];
      let minDist = Infinity;
      let nearestIdx = 0;

      unvisited.forEach((pt, idx) => {
        const dLat = pt.lat - current.lat;
        const dLng = pt.lng - current.lng;
        const dist = dLat * dLat + dLng * dLng;
        if (dist < minDist) {
          minDist = dist;
          nearestIdx = idx;
        }
      });

      result.push(unvisited[nearestIdx]);
      unvisited.splice(nearestIdx, 1);
    }

    return result;
  };

  const handleSmartRouteToggle = () => {
    if (isOptimized) {
      const restored = [...originalRoutePointsRef.current];
      originalRoutePointsRef.current = [];
      setIsOptimized(false);
      if (restored.length > 0) {
        setSelectedRoutePoints(restored);
      }
      return;
    }

    if (selectedRoutePoints.length < 2) return;

    const optimized = nearestNeighborSort(selectedRoutePoints);
    originalRoutePointsRef.current = [...selectedRoutePoints];
    setSelectedRoutePoints([...optimized]);
    setIsOptimized(true);
  };

  const handleViewItinerary = () => {
    if (selectedRoutePoints.length === 0) return;
    const routePoints = selectedRoutePoints.map((point) => ({
      id: point.id,
      name: point.name,
      category: point.category || point.type || 'landmark',
      description: point.description || '',
      lat: point.lat,
      lng: point.lng,
      priority: point.priority ?? 3,
      region: point.region ?? '',
    }));

    navigate('/itinerary', {
      state: {
        selectedRoutePoints: routePoints,
        transport: transportType,
      },
    });
  };

  const handleSaveTrip = async () => {
    if (!tripTitle.trim() || selectedRoutePoints.length < 2 || !token) return;
    setSaveLoading(true);
    setSaveError(null);
    try {
await createTrip(
        {
          title: tripTitle.trim(),
          location_ids: selectedRoutePoints.map((p) => p.id),
          optimize: false,
        },
        token
      );
      navigate('/my-trips');
    } catch (err: any) {
      setSaveError(
        err.response?.data?.detail || 'Помилка при збереженні маршруту'
      );
      setSaveLoading(false);
    }
  };

  const tripMeta: TripMeta | undefined = (navLocation.state as any)?.tripMeta;
  const cityMeta: CityMeta | undefined = (navLocation.state as any)?.cityMeta;

  const [apiLocations, setApiLocations] = useState<ItineraryPoint[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const publicReq = api.get('/locations/');
        const myReq = (token && token !== 'null' && token !== 'undefined')
          ? api.get('/locations/', {
              params: { filter_type: 'my' },
              headers: { Authorization: `Bearer ${token.replace(/["']/g, '')}` },
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
            imageUrl: loc.image_url ?? '',
            region: loc.region,
          }));
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
              imageUrl: loc.image_url ?? '',
              region: loc.region,
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

    const interval = setInterval(fetchLocations, 120000);
    return () => clearInterval(interval);
  }, [token]);

  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const zoomParam = searchParams.get('zoom');

  const urlCenter: [number, number] | null =
    latParam && lngParam ? [parseFloat(latParam), parseFloat(lngParam)] : null;
  const urlZoom = zoomParam ? parseInt(zoomParam) : undefined;

  const activeData = itinerary.length > 0 ? itinerary : apiLocations;

  const [pointsForRouting, setPointsForRouting] = useState<[number, number][]>(
    []
  );

  useEffect(() => {
    if (selectedCityTrip) {
      const tripPoints = selectedCityTrip.trip_nodes
        .filter((n) => n.location?.lat != null && n.location?.lon != null)
        .sort((a, b) => a.order_index - b.order_index)
        .map((n) => [n.location.lat, n.location.lon] as [number, number]);
      setPointsForRouting(tripPoints);
    } else if (fetchedTripRoute.length > 0) {
      setPointsForRouting(fetchedTripRoute);
    } else {
      setPointsForRouting(
        selectedRoutePoints.map((p) => [p.lat, p.lng] as [number, number])
      );
    }
  }, [selectedRoutePoints, fetchedTripRoute, selectedCityTrip]);

  useVisibleMarkers(activeData, zoom);

  useEffect(() => {
    if (!cityMeta) return;
    setCityTripsLoading(true);
const norm = (s?: string | null) => s?.toLowerCase().trim() ?? '';
    
    const filterByCity = (trips: Trip[]) => trips.filter((trip) => {
      if (!trip.trip_nodes) return false;
      return trip.trip_nodes.some(
        (node) =>
          norm(node.location?.name) === norm(cityMeta.name) ||
          norm(node.location?.region).includes(norm(cityMeta.name)) ||
          norm(cityMeta.name).includes(norm(node.location?.region)),
      );
    });

    const promises: [Promise<Trip[]>, Promise<Trip[]> | null] = [
      getAllTrips(),
      (token && token !== 'null' && token !== 'undefined') ? getMyTrips(token) : null
    ];

    Promise.allSettled(promises)
      .then(([allRes, myRes]) => {
        if (allRes.status === 'fulfilled') {
          const trips = Array.isArray(allRes.value) ? allRes.value : [];
          setCityTrips(filterByCity(trips));
        } else {
          console.error('Error loading shared trips:', allRes.reason);
          setCityTrips([]);
        }

        if (myRes && myRes.status === 'fulfilled') {
          const trips = Array.isArray(myRes.value) ? myRes.value : [];
          setMyCityTrips(filterByCity(trips));
        } else {
          if (myRes && myRes.status === 'rejected') {
             console.error('Error loading own trips:', myRes.reason);
          }
          setMyCityTrips([]);
        }
      })
      .finally(() => setCityTripsLoading(false));
  }, [cityMeta, token]);

  const cityLocation = useMemo(
    () =>
      cityMeta
        ? (apiLocations.find(
            (loc) => loc.name.toLowerCase() === cityMeta.name.toLowerCase()
          ) ?? null)
        : null,
    [cityMeta, apiLocations]
  );

  const pointsLabel = (count: number): string => {
    if (count % 10 === 1 && count % 100 !== 11) return `${count} точка`;
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100))
      return `${count} точки`;
    return `${count} точок`;
  };

  const getRegionForCity = (cityName: string) => {
    const foundRegion = regionsData.find(
      (region) =>
        region.center === cityName ||
        region.cities.some((city) => city.name === cityName)
    );
    return foundRegion ? foundRegion.name : null;
  };

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
          ) : cityMeta && !routeBuildingMode ? (
            <div
              style={{
                padding: '12px 20px 24px',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
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
                {cityMeta.name}
              </h1>

              {cityLocation?.description && (
                <p
                  style={{
                    fontSize: '14px',
                    color: '#555',
                    lineHeight: 1.6,
                    margin: '0 0 16px',
                  }}
                >
                  {cityLocation.description}
                </p>
              )}

              {activePointDetails ? (
                <div>
                  <button
                    onClick={() => setActivePointDetails(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#3b5bdb',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '0 0 12px',
                    }}
                  >
                    ← Назад до міста
                  </button>
                  <h2
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1a1a2e',
                      margin: '0 0 8px',
                    }}
                  >
                    {activePointDetails.name}
                  </h2>
                  {activePointDetails &&
                    DANGEROUS_REGIONS.includes(
                      getRegionForCity(activePointDetails.name) || ''
                    ) && (
                      <Alert severity="warning" style={{ marginBottom: '16px' }}>
                        Warning: This route point is located in a high-risk area due
                        to the ongoing war.
                      </Alert>
                    )}
                  {activePointDetails.imageUrl && (
                    <img
                      src={activePointDetails.imageUrl}
                      alt={activePointDetails.name}
                      style={{
                        width: '100%',
                        borderRadius: '4px',
                        marginBottom: '8px',
                      }}
                    />
                  )}
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#555',
                      lineHeight: 1.6,
                      margin: '0 0 16px',
                    }}
                  >
                    {activePointDetails.description || 'Опис відсутній.'}
                  </p>
                  <button
                    onClick={() => handleSelectPoint(activePointDetails)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isPointSelected(activePointDetails)
                        ? '#ff4d4f'
                        : '#3b5bdb',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    {isPointSelected(activePointDetails)
                      ? 'Видалити з маршруту'
                      : 'Додати до маршруту'}
                  </button>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      height: '1px',
                      background: '#ebebeb',
                      margin: '0 0 16px',
                    }}
                  />

                  <button
                    onClick={() => {
                      navigate('/itinerary', {
                        state: {
                          filterRegion: cityMeta?.name || cityMeta?.name,
                          selectedRoutePoints: [],
                        },
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#3b5bdb',
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '14px',
                      letterSpacing: '0.3px',
                      marginBottom: '24px',
                    }}
                  >
                    Create Route
                  </button>

                  {token && (
                    <div style={{
                      display: 'flex',
                      background: '#f0f0f0',
                      borderRadius: '8px',
                      padding: '4px',
                      marginBottom: '20px',
                      gap: '4px'
                    }}>
                      <button
                        onClick={() => setRouteSource('provided')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: routeSource === 'provided' ? '#fff' : 'transparent',
                          color: routeSource === 'provided' ? '#3b5bdb' : '#666',
                          boxShadow: routeSource === 'provided' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        Надані
                      </button>
                      <button
                        onClick={() => setRouteSource('my')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: routeSource === 'my' ? '#fff' : 'transparent',
                          color: routeSource === 'my' ? '#3b5bdb' : '#666',
                          boxShadow: routeSource === 'my' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        Мої
                      </button>
                    </div>
                  )}

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
                    {routeSource === 'my' ? 'My Routes' : 'Created Routes'}
                  </div>

                  {cityTripsLoading ? (
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#bbb',
                        padding: '8px 0',
                      }}
                    >
                      Завантаження...
                    </div>
                  ) : (routeSource === 'my' ? myCityTrips : cityTrips).length === 0 ? (
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#bbb',
                        padding: '8px 0',
                      }}
                    >
                      {routeSource === 'my' ? 'Ви ще не створили маршрутів у цьому регіоні.' : 'Маршрутів для цього міста не знайдено.'}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        marginBottom: '20px',
                      }}
                    >
                      {(routeSource === 'my' ? myCityTrips : cityTrips).map((trip) => (
                        <div
                          key={trip.id}
                          onClick={() =>
                            setSelectedCityTrip((prev) =>
                              prev?.id === trip.id ? null : trip
                            )
                          }
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            background:
                              selectedCityTrip?.id === trip.id
                                ? '#3b5bdb'
                                : '#f8f8f8',
                            color:
                              selectedCityTrip?.id === trip.id
                                ? 'white'
                                : '#222',
                            cursor: 'pointer',
                            border: `1px solid ${selectedCityTrip?.id === trip.id ? '#3b5bdb' : '#ebebeb'}`,
                            transition: 'all 0.15s',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '13px',
                              marginBottom: '2px',
                            }}
                          >
                            {trip.title}
                          </div>
                          <div style={{ fontSize: '12px', opacity: 0.7 }}>
                            {pointsLabel(trip.trip_nodes.length)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ flex: 1 }} />
                </>
              )}
            </div>
          ) : routeBuildingMode ? (
            <div
              style={{
                padding: '12px 20px 24px',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
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
                Побудова маршруту
              </div>

              {selectedRoutePoints.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
                  Натискайте на маркери на карті, щоб додати точки до маршруту
                </p>
              ) : (
                <ol
                  style={{
                    listStyle: 'none',
                    margin: '0 0 16px',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    userSelect: 'none',
                  }}
                >
                  {selectedRoutePoints.map((p, i) => (
                    <li
                      key={p.id}
                      data-map-route-idx={i}
                      draggable
                      onDragStart={() => handleMapDragStart(i)}
                      onDragOver={(e) => handleMapDragOver(e, i)}
                      onDrop={(e) => handleMapDrop(e, i)}
                      onDragEnd={handleMapDragEnd}
                      onTouchStart={() => handleMapTouchStart(i)}
                      onTouchMove={handleMapTouchMove}
                      onTouchEnd={handleMapTouchEnd}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        borderTop: mapDragOverIdx === i && mapDraggingIdx !== i ? '2px solid #3b5bdb' : '2px solid transparent',
                        background: mapDragOverIdx === i && mapDraggingIdx !== i
                          ? '#e8f0fe'
                          : i === 0 ? '#f0f7f4'
                          : i === selectedRoutePoints.length - 1 ? '#f7f0f0'
                          : 'transparent',
                        opacity: mapDraggingIdx === i ? 0.35 : 1,
                        cursor: 'grab',
                        touchAction: 'none',
                        transition: 'opacity 0.15s, background 0.1s',
                      }}
                    >
                      <svg width="10" height="14" viewBox="0 0 10 14" style={{ flexShrink: 0 }}>
                        <circle cx="3" cy="3" r="1.3" fill="#ccc" />
                        <circle cx="7" cy="3" r="1.3" fill="#ccc" />
                        <circle cx="3" cy="7" r="1.3" fill="#ccc" />
                        <circle cx="7" cy="7" r="1.3" fill="#ccc" />
                        <circle cx="3" cy="11" r="1.3" fill="#ccc" />
                        <circle cx="7" cy="11" r="1.3" fill="#ccc" />
                      </svg>
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background:
                            i === 0 ? '#2e7d5a'
                            : i === selectedRoutePoints.length - 1 ? '#c0392b'
                            : '#e8e8e8',
                          color: i === 0 || i === selectedRoutePoints.length - 1 ? '#fff' : '#555',
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
                      <span style={{ fontSize: '13px', color: '#222', fontWeight: 500, flex: 1 }}>
                        {p.name}
                      </span>
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => handleSelectPoint(p)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#bbb',
                          fontSize: '18px',
                          padding: '0 4px',
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ol>
              )}

              {activePointDetails && (
                <div
                  style={{
                    padding: '12px',
                    background: '#f8f9ff',
                    borderRadius: '8px',
                    border: '1px solid #e0e6ff',
                    marginBottom: '16px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      margin: '0 0 8px',
                      color: '#1a1a2e',
                    }}
                  >
                    {activePointDetails.name}
                  </h3>
                  {activePointDetails &&
                    DANGEROUS_REGIONS.includes(
                      getRegionForCity(activePointDetails.name) || ''
                    ) && (
                      <Alert
                        severity="warning"
                        style={{ marginBottom: '12px', fontSize: '12px' }}
                      >
                        Warning: This route point is located in a high-risk area due
                        to the ongoing war.
                      </Alert>
                    )}
                  <button
                    onClick={() => handleSelectPoint(activePointDetails)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isPointSelected(activePointDetails)
                        ? '#ff4d4f'
                        : '#3b5bdb',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {isPointSelected(activePointDetails)
                      ? 'Видалити з маршруту'
                      : 'Додати до маршруту'}
                  </button>
                </div>
              )}

              <div style={{ flex: 1 }} />

              {selectedRoutePoints.length > 0 && (
                <button
                  onClick={handleViewItinerary}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: selectedRoutePoints.length > 0 ? '#3b5bdb' : '#ccc',
                    color: 'white',
                    fontWeight: 700,
                    cursor: selectedRoutePoints.length > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    letterSpacing: '0.5px',
                    marginBottom: '10px',
                  }}
                >
                  Переглянути маршрут у Itinerary
                </button>
              )}

              {cityMeta && (
                <button
                  onClick={() => {
                    setRouteBuildingMode(false);
                    setSelectedRoutePoints([]);
                    setActivePointDetails(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    backgroundColor: 'transparent',
                    color: '#555',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  ← Назад до {cityMeta.name}
                </button>
              )}
            </div>
          ) : selectedRoutePoints.length > 0 && !cityMeta ? (
            <div
              style={{
                padding: '12px 20px 24px',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
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
                Route · {selectedRoutePoints.length} stops
              </div>

              <ol
                style={{
                  listStyle: 'none',
                  margin: '0 0 16px',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  userSelect: 'none',
                }}
              >
                {selectedRoutePoints.map((p, i) => (
                  <li
                    key={p.id}
                    data-map-route-idx={i}
                    draggable
                    onDragStart={() => handleMapDragStart(i)}
                    onDragOver={(e) => handleMapDragOver(e, i)}
                    onDrop={(e) => handleMapDrop(e, i)}
                    onDragEnd={handleMapDragEnd}
                    onTouchStart={() => handleMapTouchStart(i)}
                    onTouchMove={handleMapTouchMove}
                    onTouchEnd={handleMapTouchEnd}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      borderTop: mapDragOverIdx === i && mapDraggingIdx !== i ? '2px solid #3b5bdb' : '2px solid transparent',
                      background: mapDragOverIdx === i && mapDraggingIdx !== i
                        ? '#e8f0fe'
                        : i === 0 ? '#f0f7f4'
                        : i === selectedRoutePoints.length - 1 ? '#f7f0f0'
                        : 'transparent',
                      opacity: mapDraggingIdx === i ? 0.35 : 1,
                      cursor: 'grab',
                      touchAction: 'none',
                      transition: 'opacity 0.15s, background 0.1s',
                    }}
                  >
                    <svg width="10" height="14" viewBox="0 0 10 14" style={{ flexShrink: 0 }}>
                      <circle cx="3" cy="3" r="1.3" fill="#ccc" />
                      <circle cx="7" cy="3" r="1.3" fill="#ccc" />
                      <circle cx="3" cy="7" r="1.3" fill="#ccc" />
                      <circle cx="7" cy="7" r="1.3" fill="#ccc" />
                      <circle cx="3" cy="11" r="1.3" fill="#ccc" />
                      <circle cx="7" cy="11" r="1.3" fill="#ccc" />
                    </svg>
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background:
                          i === 0 ? '#2e7d5a'
                          : i === selectedRoutePoints.length - 1 ? '#c0392b'
                          : '#e8e8e8',
                        color: i === 0 || i === selectedRoutePoints.length - 1 ? '#fff' : '#555',
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
                    <span style={{ fontSize: '13px', color: '#222', fontWeight: 500, flex: 1 }}>
                      {p.name}
                    </span>
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => handleSelectPoint(p)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#bbb',
                        fontSize: '18px',
                        padding: '0 4px',
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ol>

              <div
                style={{
                  height: '1px',
                  background: '#ebebeb',
                  margin: '0 0 16px',
                }}
              />

              {!saveMode ? (
                <>
                  <button
                    onClick={handleViewItinerary}
                    disabled={selectedRoutePoints.length === 0}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: selectedRoutePoints.length > 0 ? '#3b5bdb' : '#ccc',
                      color: 'white',
                      fontWeight: 700,
                      cursor: selectedRoutePoints.length > 0 ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                    }}
                  >
                    Перейти до Itinerary
                  </button>
                  <button
                    onClick={() => setSaveMode(true)}
                    disabled={!token}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: token ? '#1a1a2e' : '#ccc',
                      color: 'white',
                      fontWeight: 700,
                      cursor: token ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                    }}
                    title={!token ? 'Увійдіть, щоб зберегти маршрут' : ''}
                  >
                    Зберегти маршрут
                  </button>
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Назва маршруту..."
                    value={tripTitle}
                    onChange={(e) => setTripTitle(e.target.value)}
                    autoFocus
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #3b5bdb',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  {saveError && (
                    <p
                      style={{ margin: 0, fontSize: '12px', color: '#c0392b' }}
                    >
                      {saveError}
                    </p>
                  )}
                  <button
                    onClick={handleSaveTrip}
                    disabled={saveLoading || !tripTitle.trim()}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor:
                        saveLoading || !tripTitle.trim() ? '#aaa' : '#2e7d5a',
                      color: 'white',
                      fontWeight: 700,
                      cursor:
                        saveLoading || !tripTitle.trim()
                          ? 'not-allowed'
                          : 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    {saveLoading ? 'Збереження...' : 'Зберегти'}
                  </button>
                  <button
                    onClick={() => {
                      setSaveMode(false);
                      setSaveError(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      backgroundColor: 'transparent',
                      color: '#555',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    Скасувати
                  </button>
                </div>
              )}

              {!token && (
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'center',
                  }}
                >
                  Увійдіть в акаунт, щоб зберегти маршрут
                </p>
              )}
            </div>
          ) : activePointDetails ? (
            <div style={{ padding: '12px 20px 24px', flex: 1 }}>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1a1a2e',
                  margin: '0 0 8px',
                  lineHeight: 1.2,
                }}
              >
                {activePointDetails.name}
              </h2>
              {activePointDetails &&
                DANGEROUS_REGIONS.includes(
                  getRegionForCity(activePointDetails.name) || ''
                ) && (
                  <Alert severity="warning" style={{ marginBottom: '16px' }}>
                    Warning: This route point is located in a high-risk area due to
                    the ongoing war.
                  </Alert>
                )}
              {getRegionForCity(activePointDetails.name) && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#888',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {getRegionForCity(activePointDetails.name)}
                </span>
              )}
              {activePointDetails.imageUrl && (
                <img
                  src={activePointDetails.imageUrl}
                  alt={activePointDetails.name}
                  style={{
                    width: '100%',
                    borderRadius: '4px',
                    marginTop: '8px',
                    marginBottom: '8px',
                  }}
                />
              )}
              <p
                style={{
                  fontSize: '14px',
                  color: '#555',
                  lineHeight: 1.6,
                  margin: '0 0 20px',
                }}
              >
                {activePointDetails.description || 'Опис відсутній.'}
              </p>
              <button
                onClick={() => handleSelectPoint(activePointDetails)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isPointSelected(activePointDetails)
                    ? '#ff4d4f'
                    : '#3b5bdb',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                {isPointSelected(activePointDetails)
                  ? 'Видалити з маршруту'
                  : 'Додати до маршруту'}
              </button>
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
          {isRouteLoading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              Завантаження маршруту...
            </div>
          )}
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

          {selectedRoutePoints.length > 2 && (
            <div
              onClick={handleSmartRouteToggle}
              style={{
                position: 'absolute',
                top: CTRL_TOP,
                right: '16px',
                zIndex: 999,
                backgroundColor: isOptimized ? '#f0f4ff' : 'white',
                padding: '10px 16px',
                borderRadius: '30px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                border: isOptimized ? '1px solid #3b5bdb' : '1px solid #eee',
                transition: 'all 0.2s',
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
                  accentColor: '#3b5bdb',
                }}
              />
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '12px',
                  color: isOptimized ? '#3b5bdb' : '#111',
                }}
              >
                {isOptimized ? 'SMART ROUTE' : 'MY ORDER'}
              </span>
            </div>
          )}

          <div
            onClick={() => {
              setLayerPanelOpen(!layerPanelOpen);
            }}
            title="Базові шари"
            style={{
              position: 'absolute',
              top: selectedRoutePoints.length > 2 ? CTRL_TOP + 162 +56 : CTRL_TOP + 162,
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

          {layerPanelOpen && (
            <div
              style={{
                position: 'absolute',
                top: selectedRoutePoints.length > 2 ? CTRL_TOP + 162 + 56 : CTRL_TOP + 162,
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

          {}
          <div
            style={{
              position: 'absolute',
              top: selectedRoutePoints.length > 2 ? CTRL_TOP + 56 : CTRL_TOP,
              right: '16px',
              zIndex: 999,
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              border: '1px solid #e8e8e8',
              overflow: 'hidden',
              width: '44px',
            }}
          >
            {(['car', 'bike', 'foot'] as TransportType[]).map((type, i) => (
              <React.Fragment key={type}>
                {i > 0 && (
                  <div style={{ height: '1px', background: '#f0f0f0' }} />
                )}
                <button
                  onClick={() => setTransportType(type)}
                  title={
                    type === 'car'
                      ? 'Автомобіль'
                      : type === 'bike'
                        ? 'Велосипед'
                        : 'Пішки'
                  }
                  style={{
                    background:
                      transportType === type ? '#3b5bdb' : 'transparent',
                    color: transportType === type ? 'white' : '#666',
                    border: 'none',
                    padding: '9px 0 7px',
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {type === 'car' && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 11L7 6h10l2 5" />
                      <rect x="2" y="11" width="20" height="7" rx="2" />
                      <circle
                        cx="7"
                        cy="18"
                        r="1.5"
                        fill="currentColor"
                        stroke="none"
                      />
                      <circle
                        cx="17"
                        cy="18"
                        r="1.5"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>
                  )}
                  {type === 'bike' && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="5.5" cy="17.5" r="3.5" />
                      <circle cx="18.5" cy="17.5" r="3.5" />
                      <path d="M15 6a1 1 0 0 0-1-1h-4" />
                      <path d="M5.5 17.5L9 9l3.5 8.5" />
                      <path d="M18.5 17.5L15 6" />
                    </svg>
                  )}
                  {type === 'foot' && (
                    <svg
                      width="16"
                      height="18"
                      viewBox="0 0 16 22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="8" cy="3" r="2" />
                      <path d="M5 21l2-7 1 2 1-2 2 7" />
                      <path d="M3.5 12l2-5h5" />
                      <path d="M3.5 12l-1.5 3" />
                      <path d="M12.5 12l1.5 3" />
                    </svg>
                  )}
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
            <UserLocation ctrlTop={selectedRoutePoints.length > 2 ? CTRL_TOP + 162 + 56 + 56 : CTRL_TOP + 162 + 56} />

            {pointsForRouting.length > 1 && (
              <Routing
                points={pointsForRouting}
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
                  icon={createCustomIcon(point.category, isPointSelected(point))}
                >
                  <MarkerPopup
                    point={point}
                    region={point.region}
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
