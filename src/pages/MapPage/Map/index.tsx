import React, { useState, useMemo, useEffect, useContext, useCallback, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../../api/auth.ts';
import axios from 'axios';

import { MapWrapper, MapPageLayout, RouteSidebar, MapArea } from './style.tsx';
import { createCustomIcon } from './icons.tsx';
import { ZoomHandler } from './component/ZoomHandler.tsx';
import { MarkerPopup } from './component/MarkerPopup.tsx';
import { useVisibleMarkers } from './useVisibleMarkers.ts';
import { MapController } from './component/MapController.tsx';
const Routing = lazy(() => import('./component/Routing.tsx'));
import { UserLocation } from './component/UserLocation.tsx';
import type { ItineraryPoint, Trip } from '../../../types/types.ts';
import { getAllTrips, getMyTrips, createTrip, getLikedTrips, toggleTripLike } from '../../../api/trips.ts';

// State management
import { useMapState } from './hooks/useMapState';

// Components
import { SidebarTripMetaContent } from './components/sidebar/SidebarTripMetaContent';
import { SidebarCityMetaContent } from './components/sidebar/SidebarCityMetaContent';
import { SidebarDefaultContent } from './components/sidebar/SidebarDefaultContent';
import { SidebarRouteBuildingContent } from './components/sidebar/SidebarRouteBuildingContent';
import { LayerPanel } from './components/controls/LayerPanel';
import { TransportSelector } from './components/controls/TransportSelector';

// Utils
import { getRegionForCity } from './utils/mapHelpers';


const HEADER_H = 80;
const UKRAINE_CENTER: [number, number] = [48.3794, 31.1656];
const DEFAULT_ZOOM = 6;

const ukraineBounds: L.LatLngBoundsLiteral = [
  [44.3863, 22.1372], // Southwest
  [52.3791, 40.2277], // Northeast
];

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

const pointsLabel = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) return `${count} точка`;
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100))
    return `${count} точки`;
  return `${count} точок`;
};

const getRegionForCity = (cityName: string) => {
  const regionsData = require('../../../librarian/cities.json');
  const foundRegion = regionsData.find(
    (region: any) =>
      region.center === cityName ||
      region.cities.some((city: any) => city.name === cityName)
  );
  return foundRegion ? foundRegion.name : null;
};

export const MapComponent: React.FC<{ itinerary?: ItineraryPoint[] }> = ({
  itinerary = [],
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Use the custom state hook
  const {
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
    selectedRoutePoints,
    setSelectedRoutePoints,
    transportType,
    setTransportType,
    pointsForRouting,
    setPointsForRouting,
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
    saveLoading,
    setSaveLoading,
    saveError,
    setSaveError,
    isRouteLoading,
    setIsRouteLoading,
    cityTripsLoading,
    setCityTripsLoading,
    routeSource,
    setRouteSource,
    hasFetchedProvided,
    setHasFetchedProvided,
    hasFetchedMy,
    setHasFetchedMy,
    fetchedTripRoute,
    setFetchedTripRoute,
    mapDraggingIdx,
    mapDragOverIdx,
    mapDragNodeRef,
    tripMeta,
    cityMeta,
    handleMapDragStart,
    handleMapDragOver,
    handleMapDrop,
    handleMapDragEnd,
    handleMapTouchStart,
    handleMapTouchMove,
    handleMapTouchEnd,
    token,
  } = useMapState(itinerary);

  const CTRL_TOP = isMobile ? 16 : HEADER_H + 12;

  const urlView = useMemo(() => {
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const zoomParam = searchParams.get('zoom');

    const center: [number, number] | null =
      latParam && lngParam
        ? [parseFloat(latParam), parseFloat(lngParam)]
        : null;
    const zoom = zoomParam ? parseInt(zoomParam) : undefined;

    return { center, zoom };
  }, [searchParams]);

  const handleSelectPoint = useCallback((point: ItineraryPoint) => {
    const bounds = L.latLngBounds(ukraineBounds);
    if (!bounds.contains([point.lat, point.lng])) {
      return;
    }

    setSelectedRoutePoints((prev) => {
      const isSelected = prev.some((p) => p.id === point.id);
      return isSelected ? prev.filter((p) => p.id !== point.id) : [...prev, point];
    });
    setActivePointDetails(point);
  }, []);

  const isPointSelected = useCallback((point: ItineraryPoint) => {
    return selectedRoutePoints.some((p) => p.id === point.id);
  }, [selectedRoutePoints]);

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

  const handleShowDetails = async () => {
    if (selectedRoutePoints.length < 2) return;

    const cleanToken =
      token && token !== 'null' && token !== 'undefined'
        ? token.replace(/["']/g, '')
        : null;

    if (!cleanToken) {
      navigate('/login');
      return;
    }

    setSaveLoading(true);
    setSaveError(null);
    try {
      const autoTitle =
        `${selectedRoutePoints[0].name} → ${selectedRoutePoints[selectedRoutePoints.length - 1].name}`;
      const trip = await createTrip(
        {
          title: autoTitle,
          location_ids: selectedRoutePoints.map((p) => p.id),
          optimize: false,
        },
        cleanToken
      );
      navigate(`/trip/${trip.id}`);
    } catch (err: any) {
      setSaveError(
        err.response?.data?.detail || 'Помилка при створенні маршруту'
      );
      setSaveLoading(false);
    }
  };

  const tripMeta_: TripMeta | undefined = (tripMeta as any)?.tripMeta;

  // Load locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const publicReq = api.get('/locations/');
        const myReq =
          token && token !== 'null' && token !== 'undefined'
            ? api.get('/locations/', {
              params: { filter_type: 'my' },
              headers: {
                Authorization: `Bearer ${token.replace(/["']/g, '')}`,
              },
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

  const activeData = itinerary.length > 0 ? itinerary : apiLocations;

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

    // Check if we already fetched for current source
    if (routeSource === 'provided' && hasFetchedProvided) return;
    if (routeSource === 'my' && hasFetchedMy) return;

    setCityTripsLoading(true);
    const norm = (s?: string | null) => s?.toLowerCase().trim() ?? '';

    const filterByCity = (trips: Trip[]) =>
      trips.filter((trip) => {
        if (!trip.trip_nodes) return false;
        return trip.trip_nodes.some(
          (node) =>
            norm(node.location?.name) === norm(cityMeta.name) ||
            norm(node.location?.region).includes(norm(cityMeta.name)) ||
            norm(cityMeta.name).includes(norm(node.location?.region))
        );
      });

    const promises: [Promise<Trip[]> | null, Promise<Trip[]> | null, Promise<any> | null] = [
      routeSource === 'provided' && !hasFetchedProvided ? getAllTrips() : null,
      routeSource === 'my' && !hasFetchedMy && token && token !== 'null' && token !== 'undefined'
        ? getMyTrips(token)
        : null,
      token && token !== 'null' && token !== 'undefined' ? getLikedTrips(token) : null,
    ];

    Promise.allSettled(promises)
      .then(([allRes, myRes, likedRes]) => {
        if (allRes.status === 'fulfilled' && allRes.value) {
          const trips = Array.isArray(allRes.value) ? allRes.value : [];
          setCityTrips(filterByCity(trips));
          setHasFetchedProvided(true);
        } else if (allRes.status === 'rejected' && routeSource === 'provided') {
          console.error('Error loading shared trips:', allRes.reason);
          setCityTrips([]);
        }

        if (myRes && myRes.status === 'fulfilled' && myRes.value) {
          const trips = Array.isArray(myRes.value) ? myRes.value : [];
          setMyCityTrips(filterByCity(trips));
          setHasFetchedMy(true);
        } else if (myRes && myRes.status === 'rejected' && routeSource === 'my') {
          console.error('Error loading own trips:', myRes.reason);
          setMyCityTrips([]);
        }

        if (likedRes && likedRes.status === 'fulfilled' && likedRes.value) {
          const likedData = Array.isArray(likedRes.value) ? likedRes.value : [];
          setLikedTripIds(likedData.map((t: Trip) => t.id));
        }
      })
      .finally(() => setCityTripsLoading(false));
  }, [cityMeta, token, routeSource, hasFetchedProvided, hasFetchedMy]);

  const handleLikeClick = useCallback(async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (!token) return;

    const isLiked = likedTripIds.includes(tripId);

    if (isLiked) {
      setLikedTripIds((prev) => prev.filter((id) => id !== tripId));
    } else {
      setLikedTripIds((prev) => [...prev, tripId]);
    }

    try {
      await toggleTripLike(tripId, token);
    } catch (err) {
      console.error('Like error:', err);
      // Rollback on error
      if (isLiked) {
        setLikedTripIds((prev) => [...prev, tripId]);
      } else {
        setLikedTripIds((prev) => prev.filter((id) => id !== tripId));
      }
    }
  }, [token, likedTripIds]);

  useEffect(() => {
    setHasFetchedProvided(false);
    setHasFetchedMy(false);
  }, [cityMeta]);

  const cityLocation = useMemo(
    () =>
      cityMeta
        ? (apiLocations.find(
          (loc) => loc.name.toLowerCase() === cityMeta.name.toLowerCase()
        ) ?? null)
        : null,
    [cityMeta, apiLocations]
  );

  const layerPanelPosition = {
    top:
      selectedRoutePoints.length > 2
        ? CTRL_TOP + 162 + 56
        : CTRL_TOP + 162,
    right: 16,
  };

  const transportSelectorPosition = {
    top:
      selectedRoutePoints.length > 2
        ? CTRL_TOP + 56
        : CTRL_TOP,
    right: 16,
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
          {tripMeta ? (
            <SidebarTripMetaContent tripMeta={tripMeta} onBack={() => navigate(-1)} />
          ) : cityMeta && !routeBuildingMode ? (
            <SidebarCityMetaContent
              cityMeta={cityMeta}
              cityLocation={cityLocation}
              selectedRoutePoints={selectedRoutePoints}
              activePointDetails={activePointDetails}
              routeBuildingMode={routeBuildingMode}
              token={token}
              cityTrips={cityTrips}
              myCityTrips={myCityTrips}
              cityTripsLoading={cityTripsLoading}
              selectedCityTrip={selectedCityTrip}
              likedTripIds={likedTripIds}
              routeSource={routeSource}
              mapDraggingIdx={mapDraggingIdx}
              mapDragOverIdx={mapDragOverIdx}
              saveError={saveError}
              saveLoading={saveLoading}
              onSelectPoint={handleSelectPoint}
              onMapDragStart={handleMapDragStart}
              onMapDragOver={handleMapDragOver}
              onMapDrop={handleMapDrop}
              onMapDragEnd={handleMapDragEnd}
              onMapTouchStart={handleMapTouchStart}
              onMapTouchMove={handleMapTouchMove}
              onMapTouchEnd={handleMapTouchEnd}
              onSetActivePointDetails={setActivePointDetails}
              onSetRouteSource={setRouteSource}
              onSetSelectedCityTrip={setSelectedCityTrip}
              onLikeClick={handleLikeClick}
              onShowDetails={handleShowDetails}
              onNavigateToItinerary={(filterRegion) =>
                navigate('/itinerary', {
                  state: { filterRegion, selectedRoutePoints: [] },
                })
              }
            />
          ) : routeBuildingMode ? (
            <SidebarRouteBuildingContent
              cityMeta={cityMeta}
              selectedRoutePoints={selectedRoutePoints}
              activePointDetails={activePointDetails}
              mapDraggingIdx={mapDraggingIdx}
              mapDragOverIdx={mapDragOverIdx}
              onSelectPoint={handleSelectPoint}
              onMapDragStart={handleMapDragStart}
              onMapDragOver={handleMapDragOver}
              onMapDrop={handleMapDrop}
              onMapDragEnd={handleMapDragEnd}
              onMapTouchStart={handleMapTouchStart}
              onMapTouchMove={handleMapTouchMove}
              onMapTouchEnd={handleMapTouchEnd}
              onSetActivePointDetails={setActivePointDetails}
              onViewItinerary={handleViewItinerary}
              onExitRouteBuildingMode={() => {
                setRouteBuildingMode(false);
                setSelectedRoutePoints([]);
                setActivePointDetails(null);
              }}
            />
          ) : (
            <SidebarDefaultContent
              selectedRoutePoints={selectedRoutePoints}
              activePointDetails={activePointDetails}
              mapDraggingIdx={mapDraggingIdx}
              mapDragOverIdx={mapDragOverIdx}
              saveError={saveError}
              saveLoading={saveLoading}
              token={token}
              onSelectPoint={handleSelectPoint}
              onMapDragStart={handleMapDragStart}
              onMapDragOver={handleMapDragOver}
              onMapDrop={handleMapDrop}
              onMapDragEnd={handleMapDragEnd}
              onMapTouchStart={handleMapTouchStart}
              onMapTouchMove={handleMapTouchMove}
              onMapTouchEnd={handleMapTouchEnd}
              onSetActivePointDetails={setActivePointDetails}
              onShowDetails={handleShowDetails}
            />
          )}
        </RouteSidebar>

        <MapArea>
          {isRouteLoading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.88)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: '4px solid #ddd',
                    borderTop: '4px solid #1d4ed8',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 12px',
                  }}
                />
                <div style={{ color: '#444', fontSize: 14 }}>Будуємо маршрут...</div>
              </div>
            </div>
          )}

          <LayerPanel
            activeLayer={activeLayer}
            onLayerSelect={setActiveLayer}
            onClose={() => setLayerPanelOpen(false)}
            position={{ top: CTRL_TOP + 162, right: 16 }}
          />

          <TransportSelector
            activeTransport={transportType}
            onTransportChange={setTransportType}
            position={{ top: CTRL_TOP, right: 16 }}
          />

          <MapContainer
            center={urlView.center || UKRAINE_CENTER}
            zoom={urlView.zoom || DEFAULT_ZOOM}
            zoomControl={false}
            scrollWheelZoom
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
                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}@2x.png"
                attribution="&copy; OpenStreetMap contributors & CartoDB"
                maxZoom={19}
                opacity={0.85}
                zIndex={2}
              />
            )}

            <ZoomHandler setZoom={setZoom} />
            <MapController center={urlView.center || UKRAINE_CENTER} zoom={urlView.zoom || DEFAULT_ZOOM} />
            <UserLocation />

            {pointsForRouting.length > 1 && (
              <Routing points={pointsForRouting} transportType={transportType} />
            )}

            {pointsForRouting.length > 1 && (
              <Polyline
                positions={pointsForRouting}
                pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.8 }}
              />
            )}

            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createClusterCustomIcon}
            >
              {activeData.map((point) => (
                <Marker
                  key={point.id}
                  position={[point.lat, point.lng]}
                  icon={createCustomIcon(point)}
                  eventHandlers={{ click: () => handleSelectPoint(point) }}
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

export default MapComponent;
              onMapDragStart={handleMapDragStart}
              onMapDragOver={handleMapDragOver}
              onMapDrop={handleMapDrop}
              onMapDragEnd={handleMapDragEnd}
              onMapTouchStart={handleMapTouchStart}
              onMapTouchMove={handleMapTouchMove}
              onMapTouchEnd={handleMapTouchEnd}
              onSetActivePointDetails={setActivePointDetails}
              onSetRouteSource={setRouteSource}
              onSetSelectedCityTrip={setSelectedCityTrip}
              onLikeClick={handleLikeClick}
              onShowDetails={handleShowDetails}
              onNavigateToItinerary={(filterRegion) =>
                navigate('/itinerary', {
                  state: {
                    filterRegion,
                    selectedRoutePoints: [],
                  },
                })
              }
            />
          ) : routeBuildingMode ? (
            <SidebarRouteBuildingContent
              cityMeta={cityMeta}
              selectedRoutePoints={selectedRoutePoints}
              activePointDetails={activePointDetails}
              mapDraggingIdx={mapDraggingIdx}
              mapDragOverIdx={mapDragOverIdx}
              onSelectPoint={handleSelectPoint}
              onMapDragStart={handleMapDragStart}
              onMapDragOver={handleMapDragOver}
              onMapDrop={handleMapDrop}
              onMapDragEnd={handleMapDragEnd}
              onMapTouchStart={handleMapTouchStart}
              onMapTouchMove={handleMapTouchMove}
              onMapTouchEnd={handleMapTouchEnd}
              onSetActivePointDetails={setActivePointDetails}
              onViewItinerary={handleViewItinerary}
              onExitRouteBuildingMode={() => {
                setRouteBuildingMode(false);
                setSelectedRoutePoints([]);
                setActivePointDetails(null);
              }}
            />
          ) : (
            <SidebarDefaultContent
              selectedRoutePoints={selectedRoutePoints}
              activePointDetails={activePointDetails}
              mapDraggingIdx={mapDraggingIdx}
              mapDragOverIdx={mapDragOverIdx}
              saveError={saveError}
              saveLoading={saveLoading}
              token={token}
              onSelectPoint={handleSelectPoint}
              onMapDragStart={handleMapDragStart}
              onMapDragOver={handleMapDragOver}
              onMapDrop={handleMapDrop}
              onMapDragEnd={handleMapDragEnd}
              onMapTouchStart={handleMapTouchStart}
              onMapTouchMove={handleMapTouchMove}
              onMapTouchEnd={handleMapTouchEnd}
              onSetActivePointDetails={setActivePointDetails}
              onShowDetails={handleShowDetails}
            />
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
                background: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e0e0e0',
                    borderTop: '4px solid #3b5bdb',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px',
                  }}
                />
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Будуємо маршрут...</p>
              </div>
            </div>
          )}

          {/* Layer Panel Control */}
          <LayerPanel
            activeLayer={activeLayer}
            onLayerSelect={setActiveLayer}
            onClose={() => setLayerPanelOpen(false)}
            position={layerPanelPosition}
          />

          {/* Transport Selector Control */}
          <TransportSelector
            activeTransport={transportType}
            onTransportChange={setTransportType}
            position={transportSelectorPosition}
          />

          <MapContainer
            center={urlView.center || UKRAINE_CENTER}
            zoom={urlView.zoom || DEFAULT_ZOOM}
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
                  <ol
                    style={{
                      listStyle: 'none',
                      margin: '0 0 10px',
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
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
                          gap: '7px',
                          padding: '7px 8px',
                          borderRadius: '8px',
                          borderTop:
                            mapDragOverIdx === i && mapDraggingIdx !== i
                              ? '2px solid #000'
                              : '2px solid transparent',
                          background:
                            mapDragOverIdx === i && mapDraggingIdx !== i
                              ? '#f0f0f0'
                              : i === 0
                                ? '#f0f7f4'
                                : i === selectedRoutePoints.length - 1
                                  ? '#f7f0f0'
                                  : '#fafafa',
                          opacity: mapDraggingIdx === i ? 0.35 : 1,
                          cursor: 'grab',
                          touchAction: 'none',
                          transition: 'opacity 0.15s, background 0.1s',
                        }}
                      >
                        <svg
                          width="8"
                          height="12"
                          viewBox="0 0 10 14"
                          style={{ flexShrink: 0 }}
                        >
                          <circle cx="3" cy="3" r="1.3" fill="#ccc" />
                          <circle cx="7" cy="3" r="1.3" fill="#ccc" />
                          <circle cx="3" cy="7" r="1.3" fill="#ccc" />
                          <circle cx="7" cy="7" r="1.3" fill="#ccc" />
                          <circle cx="3" cy="11" r="1.3" fill="#ccc" />
                          <circle cx="7" cy="11" r="1.3" fill="#ccc" />
                        </svg>
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background:
                              i === 0
                                ? '#2e7d5a'
                                : i === selectedRoutePoints.length - 1
                                  ? '#c0392b'
                                  : '#e8e8e8',
                            color:
                              i === 0 || i === selectedRoutePoints.length - 1
                                ? '#fff'
                                : '#555',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#222',
                            fontWeight: 500,
                            flex: 1,
                          }}
                        >
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
                            fontSize: '16px',
                            padding: '0 2px',
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
                      margin: '0 0 12px',
                    }}
                  />
                </>
              )}

              {/* ── Active point detail card ── */}
              {activePointDetails ? (
                <div
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '10px',
                    border: '1px solid #ebebeb',
                    padding: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <button
                    onClick={() => setActivePointDetails(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#888',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '0 0 8px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    ← Назад до міста
                  </button>
                  <h2
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#1a1a2e',
                      margin: '0 0 6px',
                    }}
                  >
                    {activePointDetails.name}
                  </h2>
                  {activePointDetails &&
                    DANGEROUS_REGIONS.includes(
                      getRegionForCity(activePointDetails.name) || ''
                    ) && (
                      <Alert
                        severity="warning"
                        style={{ marginBottom: '10px', fontSize: '12px' }}
                      >
                        Warning: High-risk area due to the ongoing war.
                      </Alert>
                    )}
                  {activePointDetails.imageUrl && (
                    <img
                      src={activePointDetails.imageUrl}
                      alt={activePointDetails.name}
                      style={{
                        width: '100%',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        maxHeight: '130px',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {activePointDetails.description && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#666',
                        lineHeight: 1.5,
                        margin: '0 0 10px',
                      }}
                    >
                      {activePointDetails.description.length > 100
                        ? activePointDetails.description.slice(0, 100) + '…'
                        : activePointDetails.description}
                    </p>
                  )}
                  <button
                    onClick={() => handleSelectPoint(activePointDetails)}
                    style={{
                      width: '100%',
                      padding: '9px',
                      borderRadius: '7px',
                      border: 'none',
                      backgroundColor: isPointSelected(activePointDetails)
                        ? '#ff4d4f'
                        : '#000',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'background 0.15s',
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
                      margin: '0 0 14px',
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
                      backgroundColor: '#000',
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '14px',
                      letterSpacing: '0.3px',
                      marginBottom: '20px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = '#333')
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = '#000')
                    }
                  >
                    Create Trip
                  </button>

                  {token && (
                    <div
                      style={{
                        display: 'flex',
                        background: '#f0f0f0',
                        borderRadius: '8px',
                        padding: '4px',
                        marginBottom: '16px',
                        gap: '4px',
                      }}
                    >
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
                          backgroundColor:
                            routeSource === 'provided' ? '#fff' : 'transparent',
                          color:
                            routeSource === 'provided' ? '#000' : '#666',
                          boxShadow:
                            routeSource === 'provided'
                              ? '0 2px 4px rgba(0,0,0,0.05)'
                              : 'none',
                          transition: 'all 0.2s',
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
                          backgroundColor:
                            routeSource === 'my' ? '#fff' : 'transparent',
                          color: routeSource === 'my' ? '#000' : '#666',
                          boxShadow:
                            routeSource === 'my'
                              ? '0 2px 4px rgba(0,0,0,0.05)'
                              : 'none',
                          transition: 'all 0.2s',
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
                    {routeSource === 'my' ? 'My Trips' : 'Created Trips'}
                  </div>

                  {cityTripsLoading ? (
                    <div
                      style={{ fontSize: '13px', color: '#bbb', padding: '8px 0' }}
                    >
                      Завантаження...
                    </div>
                  ) : (routeSource === 'my' ? myCityTrips : cityTrips)
                    .length === 0 ? (
                    <div
                      style={{ fontSize: '13px', color: '#bbb', padding: '8px 0' }}
                    >
                      {routeSource === 'my'
                        ? 'Ви ще не створили маршрутів у цьому регіоні.'
                        : 'Маршрутів для цього міста не знайдено.'}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        marginBottom: '16px',
                      }}
                    >
                      {(routeSource === 'my' ? myCityTrips : cityTrips).map((trip) => {
                        const isLiked = likedTripIds.includes(trip.id); // 👈 Перевіряємо чи лайкнуто

                        return (
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
                                  ? '#000'
                                  : '#f8f8f8',
                              color:
                                selectedCityTrip?.id === trip.id
                                  ? 'white'
                                  : '#222',
                              cursor: 'pointer',
                              border: `1px solid ${selectedCityTrip?.id === trip.id ? '#000' : '#ebebeb'}`,
                              transition: 'all 0.15s',
                              display: 'flex', // 👈 Додали Flex
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
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

                            {/* 👈 Малюємо сердечко */}
                            {token && routeSource !== 'my' && (
                              <>
                              {selectedCityTrip?.id === trip.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`/trip/${trip.id}`, '_blank');
                                }}
                                style={{
                                  backgroundColor: 'white',
                                  color: 'black',
                                  border: '1px solid black',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  textTransform: 'uppercase',
                                }}
                              >
                                DETAILS
                              </button>
                            )}
                              <button
                                onClick={(e) => handleLikeClick(e, trip.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '0 0 0 8px',
                                  color: selectedCityTrip?.id === trip.id
                                    ? (isLiked ? '#ff4d4f' : 'rgba(255,255,255,0.7)')
                                    : (isLiked ? '#ff4d4f' : '#bbb'),
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {isLiked ? <FavoriteIcon sx={{ fontSize: 20 }} /> : <FavoriteBorderIcon sx={{ fontSize: 20 }} />}
                              </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ flex: 1 }} />
                </>) }
              {/* ── Show Details button (завжди внизу) ── */}
              {selectedRoutePoints.length > 0 &&
                selectedRoutePoints.length < 2 && (
                  <p
                    style={{
                      margin: '0 0 8px',
                      fontSize: '12px',
                      color: '#aaa',
                      textAlign: 'center',
                    }}
                  >
                    Оберіть ще{' '}
                    {2 - selectedRoutePoints.length === 1
                      ? '1 точку'
                      : `${2 - selectedRoutePoints.length} точки`}{' '}
                    для поїздки
                  </p>
                )}
              {saveError && (
                <p
                  style={{
                    margin: '0 0 8px',
                    fontSize: '12px',
                    color: '#c0392b',
                    textAlign: 'center',
                  }}
                >
                  {saveError}
                </p>
              )}
              <button
                onClick={handleShowDetails}
                disabled={selectedRoutePoints.length < 2 || saveLoading}
                title={
                  selectedRoutePoints.length < 2
                    ? 'Оберіть щонайменше 2 точки'
                    : ''
                }
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor:
                    selectedRoutePoints.length >= 2 && !saveLoading
                      ? '#000'
                      : '#e8e8e8',
                  color:
                    selectedRoutePoints.length >= 2 && !saveLoading
                      ? '#fff'
                      : '#aaa',
                  fontWeight: 700,
                  cursor:
                    selectedRoutePoints.length >= 2 && !saveLoading
                      ? 'pointer'
                      : 'not-allowed',
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                  transition: 'background-color 0.2s, color 0.2s',
                }}
                onMouseOver={(e) => {
                  if (selectedRoutePoints.length >= 2 && !saveLoading)
                    e.currentTarget.style.backgroundColor = '#222';
                }}
                onMouseOut={(e) => {
                  if (selectedRoutePoints.length >= 2 && !saveLoading)
                    e.currentTarget.style.backgroundColor = '#000';
                }}
              >
                {saveLoading ? 'Завантаження...' : 'Show Details'}
              </button>

              {!token && selectedRoutePoints.length >= 2 && (
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'center',
                  }}
                >
                  Увійдіть для перегляду деталей поїздки
                </p>
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
                Побудова поїздки
              </div>

              {selectedRoutePoints.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
                  Натискайте на маркери на карті, щоб додати точки до поїздки
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
                        borderTop:
                          mapDragOverIdx === i && mapDraggingIdx !== i
                            ? '2px solid #3b5bdb'
                            : '2px solid transparent',
                        background:
                          mapDragOverIdx === i && mapDraggingIdx !== i
                            ? '#e8f0fe'
                            : i === 0
                              ? '#f0f7f4'
                              : i === selectedRoutePoints.length - 1
                                ? '#f7f0f0'
                                : 'transparent',
                        opacity: mapDraggingIdx === i ? 0.35 : 1,
                        cursor: 'grab',
                        touchAction: 'none',
                        transition: 'opacity 0.15s, background 0.1s',
                      }}
                    >
                      <svg
                        width="10"
                        height="14"
                        viewBox="0 0 10 14"
                        style={{ flexShrink: 0 }}
                      >
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
                            i === 0
                              ? '#2e7d5a'
                              : i === selectedRoutePoints.length - 1
                                ? '#c0392b'
                                : '#e8e8e8',
                          color:
                            i === 0 || i === selectedRoutePoints.length - 1
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
                          flex: 1,
                        }}
                      >
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
                        Warning: This route point is located in a high-risk area
                        due to the ongoing war.
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
                    backgroundColor:
                      selectedRoutePoints.length > 0 ? '#3b5bdb' : '#ccc',
                    color: 'white',
                    fontWeight: 700,
                    cursor:
                      selectedRoutePoints.length > 0
                        ? 'pointer'
                        : 'not-allowed',
                    fontSize: '14px',
                    letterSpacing: '0.5px',
                    marginBottom: '10px',
                  }}
                >
                  Переглянути поїздку
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
          ) : (
            /* ── Default panel: selected locations + Show Details ── */
            <div
              style={{
                padding: '12px 20px 24px',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header label */}
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
                {selectedRoutePoints.length === 0
                  ? 'Оберіть точки на карті'
                  : `Trip · ${selectedRoutePoints.length} ${selectedRoutePoints.length % 10 === 1 &&
                    selectedRoutePoints.length % 100 !== 11
                    ? 'зупинка'
                    : [2, 3, 4].includes(selectedRoutePoints.length % 10) &&
                      ![12, 13, 14].includes(
                        selectedRoutePoints.length % 100
                      )
                      ? 'зупинки'
                      : 'зупинок'
                  }`}
              </div>

              {/* Empty-state hint */}
              {selectedRoutePoints.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '24px 0 16px',
                    textAlign: 'center',
                    color: '#ccc',
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ddd"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginBottom: '12px' }}
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <p
                    style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}
                  >
                    Натискайте на маркери,
                    <br />
                    щоб додати точки до маршруту
                  </p>
                </div>
              ) : (
                /* Selected points list */
                <ol
                  style={{
                    listStyle: 'none',
                    margin: '0 0 12px',
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
                        borderTop:
                          mapDragOverIdx === i && mapDraggingIdx !== i
                            ? '2px solid #000'
                            : '2px solid transparent',
                        background:
                          mapDragOverIdx === i && mapDraggingIdx !== i
                            ? '#f0f0f0'
                            : i === 0
                              ? '#f0f7f4'
                              : i === selectedRoutePoints.length - 1
                                ? '#f7f0f0'
                                : 'transparent',
                        opacity: mapDraggingIdx === i ? 0.35 : 1,
                        cursor: 'grab',
                        touchAction: 'none',
                        transition: 'opacity 0.15s, background 0.1s',
                      }}
                    >
                      <svg
                        width="10"
                        height="14"
                        viewBox="0 0 10 14"
                        style={{ flexShrink: 0 }}
                      >
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
                            i === 0
                              ? '#2e7d5a'
                              : i === selectedRoutePoints.length - 1
                                ? '#c0392b'
                                : '#e8e8e8',
                          color:
                            i === 0 || i === selectedRoutePoints.length - 1
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
                          flex: 1,
                        }}
                      >
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

              {/* Active point detail card */}
              {activePointDetails && (
                <div
                  style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '10px',
                    border: '1px solid #ebebeb',
                    marginBottom: '12px',
                  }}
                >
                  {getRegionForCity(activePointDetails.name) && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#aaa',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        display: 'block',
                        marginBottom: '2px',
                      }}
                    >
                      {getRegionForCity(activePointDetails.name)}
                    </span>
                  )}
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
                        style={{ marginBottom: '10px', fontSize: '12px' }}
                      >
                        Warning: This route point is located in a high-risk
                        area due to the ongoing war.
                      </Alert>
                    )}
                  {activePointDetails.imageUrl && (
                    <img
                      src={activePointDetails.imageUrl}
                      alt={activePointDetails.name}
                      style={{
                        width: '100%',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        objectFit: 'cover',
                        maxHeight: '140px',
                      }}
                    />
                  )}
                  {activePointDetails.description && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#666',
                        lineHeight: 1.5,
                        margin: '0 0 10px',
                      }}
                    >
                      {activePointDetails.description.length > 120
                        ? activePointDetails.description.slice(0, 120) + '…'
                        : activePointDetails.description}
                    </p>
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
                        : '#000',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'background 0.15s',
                    }}
                  >
                    {isPointSelected(activePointDetails)
                      ? 'Видалити з маршруту'
                      : 'Додати до маршруту'}
                  </button>
                </div>
              )}

              <div style={{ flex: 1 }} />

              {/* Hint when < 2 points */}
              {selectedRoutePoints.length > 0 &&
                selectedRoutePoints.length < 2 && (
                  <p
                    style={{
                      margin: '0 0 8px',
                      fontSize: '12px',
                      color: '#aaa',
                      textAlign: 'center',
                    }}
                  >
                    Оберіть ще{' '}
                    {2 - selectedRoutePoints.length === 1
                      ? '1 точку'
                      : `${2 - selectedRoutePoints.length} точки`}{' '}
                    для побудови маршруту
                  </p>
                )}

              {/* Error message */}
              {saveError && (
                <p
                  style={{
                    margin: '0 0 8px',
                    fontSize: '12px',
                    color: '#c0392b',
                    textAlign: 'center',
                  }}
                >
                  {saveError}
                </p>
              )}

              {/* Show Details button */}
              <button
                onClick={handleShowDetails}
                disabled={selectedRoutePoints.length < 2 || saveLoading}
                title={
                  selectedRoutePoints.length < 2
                    ? 'Оберіть щонайменше 2 точки для побудови маршруту'
                    : !token
                      ? 'Увійдіть, щоб переглянути деталі'
                      : ''
                }
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor:
                    selectedRoutePoints.length >= 2 && !saveLoading
                      ? '#000'
                      : '#e8e8e8',
                  color:
                    selectedRoutePoints.length >= 2 && !saveLoading
                      ? '#fff'
                      : '#aaa',
                  fontWeight: 700,
                  cursor:
                    selectedRoutePoints.length >= 2 && !saveLoading
                      ? 'pointer'
                      : 'not-allowed',
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                  transition: 'background-color 0.2s, color 0.2s',
                }}
                onMouseOver={(e) => {
                  if (selectedRoutePoints.length >= 2 && !saveLoading)
                    e.currentTarget.style.backgroundColor = '#222';
                }}
                onMouseOut={(e) => {
                  if (selectedRoutePoints.length >= 2 && !saveLoading)
                    e.currentTarget.style.backgroundColor = '#000';
                }}
              >
                {saveLoading ? 'Завантаження...' : 'Show Details'}
              </button>

              {/* Login prompt */}
              {!token && selectedRoutePoints.length >= 2 && (
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'center',
                  }}
                >
                  Увійдіть в акаунт для перегляду деталей маршруту
                </p>
              )}
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
            title={sidebarOpen ? 'Сховати поїздку' : 'Показати поїздку'}
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


          <div
            onClick={() => {
              setLayerPanelOpen(!layerPanelOpen);
            }}
            title="Базові шари"
            style={{
              position: 'absolute',
              top:
                selectedRoutePoints.length > 2
                  ? CTRL_TOP + 162 + 56
                  : CTRL_TOP + 162,
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
                top:
                  selectedRoutePoints.length > 2
                    ? CTRL_TOP + 162 + 56
                    : CTRL_TOP + 162,
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

          { }
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
                      transportType === type ? '#000' : 'transparent',
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
            center={urlView.center || UKRAINE_CENTER}
            zoom={urlView.zoom || DEFAULT_ZOOM}
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
            <MapController center={urlView.center} zoom={urlView.zoom} />
            <UserLocation
              ctrlTop={
                selectedRoutePoints.length > 2
                  ? CTRL_TOP + 162 + 56 + 56
                  : CTRL_TOP + 162 + 56
              }
            />

            {fetchedTripRoute.length > 1 ? (
              <Polyline
                positions={fetchedTripRoute}
                pathOptions={{ color: '#1976d2', weight: 4, opacity: 0.85 }}
              />
            ) : pointsForRouting.length > 1 && (
              <Suspense fallback={null}>
                <Routing
                  points={pointsForRouting}
                  transportType={transportType}
                />
              </Suspense>
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
                  icon={createCustomIcon(
                    point.category,
                    isPointSelected(point)
                  )}
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
