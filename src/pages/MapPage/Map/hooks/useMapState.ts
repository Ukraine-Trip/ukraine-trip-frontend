import { useState, useCallback, useRef, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../../../context/AuthContext';
import type { ItineraryPoint, Trip } from '../../../../types/types';

type LayerType = 'grey' | 'satellite' | 'none';
type TransportType = 'car' | 'foot' | 'bike';

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

export const useMapState = (itinerary: ItineraryPoint[] = []) => {
  const { token } = useContext(AuthContext);
  const navLocation = useLocation();
  const isMobile = window.innerWidth <= 768;

  // UI State
  const [zoom, setZoom] = useState(6);
  const [activeLayer, setActiveLayer] = useState<LayerType>('grey');
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routeBuildingMode, setRouteBuildingMode] = useState(false);

  // Route State
  const [selectedRoutePoints, setSelectedRoutePoints] = useState<ItineraryPoint[]>([]);
  const [transportType, setTransportType] = useState<TransportType>('car');
  const [pointsForRouting, setPointsForRouting] = useState<[number, number][]>([]);

  // Trip & Location State
  const [activePointDetails, setActivePointDetails] = useState<ItineraryPoint | null>(null);
  const [selectedCityTrip, setSelectedCityTrip] = useState<Trip | null>(null);
  const [cityTrips, setCityTrips] = useState<Trip[]>([]);
  const [myCityTrips, setMyCityTrips] = useState<Trip[]>([]);
  const [likedTripIds, setLikedTripIds] = useState<string[]>([]);
  const [apiLocations, setApiLocations] = useState<ItineraryPoint[]>([]);

  // Loading & Error State
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [cityTripsLoading, setCityTripsLoading] = useState(false);

  // Fetching State
  const [routeSource, setRouteSource] = useState<'provided' | 'my'>('provided');
  const [hasFetchedProvided, setHasFetchedProvided] = useState(false);
  const [hasFetchedMy, setHasFetchedMy] = useState(false);
  const [fetchedTripRoute, setFetchedTripRoute] = useState<[number, number][]>([]);

  // Drag & Drop State
  const [mapDraggingIdx, setMapDraggingIdx] = useState<number | null>(null);
  const [mapDragOverIdx, setMapDragOverIdx] = useState<number | null>(null);
  const mapDragNodeRef = useRef<number | null>(null);

  // Meta State
  const tripMeta: TripMeta | undefined = (navLocation.state as any)?.tripMeta;
  const cityMeta: CityMeta | undefined = (navLocation.state as any)?.cityMeta;

  // Drag & Drop Handlers
  const handleMapDragStart = useCallback((idx: number) => {
    mapDragNodeRef.current = idx;
    setMapDraggingIdx(idx);
  }, []);

  const handleMapDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (mapDragNodeRef.current !== null && mapDragNodeRef.current !== idx)
      setMapDragOverIdx(idx);
  }, []);

  const handleMapDrop = useCallback((e: React.DragEvent, toIdx: number) => {
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
  }, []);

  const handleMapDragEnd = useCallback(() => {
    mapDragNodeRef.current = null;
    setMapDraggingIdx(null);
    setMapDragOverIdx(null);
  }, []);

  const handleMapTouchStart = useCallback((idx: number) => {
    mapDragNodeRef.current = idx;
    setMapDraggingIdx(idx);
  }, []);

  const handleMapTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const item = el?.closest('[data-map-route-idx]') as HTMLElement | null;
    if (!item) return;
    const idx = parseInt(item.dataset.mapRouteIdx ?? '-1', 10);
    if (!isNaN(idx) && idx !== mapDragNodeRef.current) setMapDragOverIdx(idx);
  }, []);

  const handleMapTouchEnd = useCallback(() => {
    const fromIdx = mapDragNodeRef.current;
    setSelectedRoutePoints((prev) => {
      if (
        fromIdx === null ||
        mapDragOverIdx === null ||
        fromIdx === mapDragOverIdx
      )
        return prev;
      const u = [...prev];
      const [m] = u.splice(fromIdx, 1);
      u.splice(mapDragOverIdx, 0, m);
      return u;
    });
    mapDragNodeRef.current = null;
    setMapDraggingIdx(null);
    setMapDragOverIdx(null);
  }, [mapDragOverIdx]);

  return {
    // UI State
    zoom,
    setZoom,
    activeLayer,
    setActiveLayer,
    layerPanelOpen,
    setLayerPanelOpen,
    sidebarOpen,
    setSidebarOpen,
    routeBuildingMode,
    setRouteBuildingMode,
    isMobile,

    // Route State
    selectedRoutePoints,
    setSelectedRoutePoints,
    transportType,
    setTransportType,
    pointsForRouting,
    setPointsForRouting,

    // Trip & Location State
    activePointDetails,
    setActivePointDetails,
    selectedCityTrip,
    setSelectedCityTrip,
    cityTrips,
    setCityTrips,
    myCityTrips,
    setMyCityTrips,
    likedTripIds,
    setLikedTripIds,
    apiLocations,
    setApiLocations,

    // Loading & Error State
    saveLoading,
    setSaveLoading,
    saveError,
    setSaveError,
    isRouteLoading,
    setIsRouteLoading,
    cityTripsLoading,
    setCityTripsLoading,

    // Fetching State
    routeSource,
    setRouteSource,
    hasFetchedProvided,
    setHasFetchedProvided,
    hasFetchedMy,
    setHasFetchedMy,
    fetchedTripRoute,
    setFetchedTripRoute,

    // Drag & Drop State
    mapDraggingIdx,
    setMapDraggingIdx,
    mapDragOverIdx,
    setMapDragOverIdx,
    mapDragNodeRef,

    // Meta
    tripMeta,
    cityMeta,

    // Handlers
    handleMapDragStart,
    handleMapDragOver,
    handleMapDrop,
    handleMapDragEnd,
    handleMapTouchStart,
    handleMapTouchMove,
    handleMapTouchEnd,

    // Context
    token,
  };
};
