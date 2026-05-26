import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../api/auth';
import { createCustomIcon } from '../MapPage/Map/icons';
import { getAllTrips } from '../../api/trips';
import type { Trip } from '../../types/types';

interface LocationData {
  id: string;
  name: string;
  description: string;
  region: string;
  type: string;
  lat: number;
  lon: number;
  priority: number;
}

const UKRAINE_CENTER: [number, number] = [48.3794, 31.1656];

const createClusterCustomIcon = (cluster: any) => {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(33, 33, true),
  });
};

type TransportType = 'car' | 'foot' | 'bike';
const transportType: TransportType = 'car';
const Routing = lazy(() => import('../MapPage/Map/component/Routing.tsx'));

const FlyToSelected: React.FC<{ center: [number, number] | null }> = ({ center }) => {
  const map = useMap();
  const prevKey = useRef('');

  useEffect(() => {
    if (!center) return;
    const key = center.join(',');
    if (key === prevKey.current) return;
    prevKey.current = key;
    map.flyTo(center, 13, { animate: true, duration: 1.0 });
  }, [map, center]);

  return null;
};

const FlyToRoute: React.FC<{ trip: Trip | null }> = ({ trip }) => {
  const map = useMap();
  const prevId = useRef('');

  useEffect(() => {
    if (!trip) {
      prevId.current = '';
      return;
    }
    if (trip.id === prevId.current) return;
    prevId.current = trip.id;

    const coords = trip.trip_nodes
      .filter((n) => n.location?.lat != null && n.location?.lon != null)
      .sort((a, b) => a.order_index - b.order_index)
      .map((n) => [n.location!.lat, n.location!.lon] as [number, number]);

    if (coords.length === 0) return;
    if (coords.length === 1) {
      map.flyTo(coords[0], 13, { animate: true, duration: 1.0 });
    } else {
      const bounds = L.latLngBounds(coords);
      map.flyToBounds(bounds, { padding: [50, 50], animate: true, duration: 1.0 });
    }
  }, [map, trip]);

  return null;
};

const pointsLabel = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) return `${count} точка`;
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100))
    return `${count} точки`;
  return `${count} точок`;
};

export const CityPage: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const [searchParams] = useSearchParams();
  const region = searchParams.get('region');
  const navigate = useNavigate();
  const navState = useLocation().state as { lat?: number; lng?: number } | null;

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<LocationData[]>('/locations/');
        setLocations(data);
        const match = data.find(
          (loc) => loc.name.toLowerCase() === cityName?.toLowerCase(),
        );
        setSelectedLocation(match ?? null);
      } catch {
        setLocations([]);
        setSelectedLocation(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, [cityName, region]);

  useEffect(() => {
    setTripsLoading(true);
    getAllTrips()
      .then(setTrips)
      .catch(() => setTrips([]))
      .finally(() => setTripsLoading(false));
  }, []);

  const normalize = (s?: string | null) => s?.toLowerCase().trim() ?? '';

  const regionTrips = trips.filter((trip) =>
    trip.trip_nodes.some((node) => {
      const locRegion = normalize(node.location?.region);
      const urlRegion = normalize(region);
      return (
        (locRegion && urlRegion && (urlRegion.includes(locRegion) || locRegion.includes(urlRegion))) ||
        normalize(node.location?.name) === normalize(cityName)
      );
    }),
  );

  const mapCenter: [number, number] | null =
    selectedLocation
      ? [selectedLocation.lat, selectedLocation.lon]
      : navState?.lat && navState?.lng
        ? [navState.lat, navState.lng]
        : null;

  // Формування координат для маршруту з урахуванням геометрії з бекенду
  const routeCoords = useMemo((): [number, number][] => {
    if (!selectedTrip) return [];

    const nodesCoords = selectedTrip.trip_nodes
      .filter((n) => n.location?.lat != null && n.location?.lon != null)
      .sort((a, b) => a.order_index - b.order_index)
      .map((n) => [n.location!.lat, n.location!.lon] as [number, number]);

    // Якщо бекенд передає детальну геометрію маршруту
    const backendRaw = (selectedTrip as any)?.route_geometry?.coordinates;
    if (Array.isArray(backendRaw) && backendRaw.length > 1) {
      try {
        // GeoJSON повертає [lon, lat], перетворюємо на [lat, lon] для Leaflet
        return backendRaw.map((c: any) => [c[1], c[0]] as [number, number]);
      } catch {
        return nodesCoords;
      }
    }
    
    // Якщо детальної геометрії немає, повертаємо звичайні точки
    return nodesCoords;
  }, [selectedTrip]);

  const handleRouteClick = (trip: Trip) => {
    setSelectedTrip((prev) => (prev?.id === trip.id ? null : trip));
  };

  const descriptionPanel = (
    <Box
      sx={{
        width: { xs: '100%', md: '30%' },
        minWidth: { md: '320px' },
        overflowY: 'auto',
        p: { xs: 3, md: 4 },
        borderRight: { xs: 'none', md: '1px solid #e0e0e0' },
        borderBottom: { xs: '1px solid #e0e0e0', md: 'none' },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton size="small" onClick={() => navigate(-1)} sx={{ ml: -1 }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
        >
          Back
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : selectedLocation ? (
        <>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1.2 }}
          >
            {selectedLocation.name}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={selectedLocation.region} size="small" sx={{ fontSize: '11px' }} />
            <Chip
              label={selectedLocation.type}
              size="small"
              color="primary"
              sx={{ fontSize: '11px' }}
            />
            <Chip
              label={`Priority ${selectedLocation.priority}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '11px' }}
            />
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {selectedLocation.description || 'Опис відсутній.'}
          </Typography>

          <Typography variant="caption" color="text.disabled" sx={{ mt: 'auto' }}>
            {selectedLocation.lat.toFixed(4)}°N,&nbsp;{selectedLocation.lon.toFixed(4)}°E
          </Typography>
        </>
      ) : (
        <>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            {cityName}
          </Typography>
          <Typography color="text.secondary">
            Натисніть на іконку на карті, щоб побачити опис локації.
          </Typography>
        </>
      )}

      <Divider sx={{ mt: 1 }} />

      <Typography
        variant="overline"
        sx={{ letterSpacing: 1.5, color: 'text.secondary', fontWeight: 600 }}
      >
        Маршрути в регіоні
      </Typography>

      {tripsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : regionTrips.length === 0 ? (
        <Typography variant="body2" color="text.disabled">
          Маршрутів для цього регіону не знайдено.
        </Typography>
      ) : (
        <List disablePadding sx={{ mx: -1 }}>
          {regionTrips.map((trip) => (
            <ListItemButton
              key={trip.id}
              selected={selectedTrip?.id === trip.id}
              onClick={() => handleRouteClick(trip)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiListItemText-secondary': { color: 'primary.contrastText', opacity: 0.8 },
                },
              }}
            >
              <ListItemText
                primary={trip.title}
                secondary={pointsLabel(trip.trip_nodes.length)}
                primaryTypographyProps={{
                  fontWeight: selectedTrip?.id === trip.id ? 700 : 500,
                  fontSize: '0.875rem',
                }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );

  const mapPanel = (
    <Box
      sx={{
        flexGrow: 1,
        flexShrink: 0,
        width: '100%',
        height: { xs: '420px', md: '100%' },
        position: 'relative',
      }}
    >
      <MapContainer
        center={UKRAINE_CENTER}
        zoom={6}
        zoomControl={true}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          attribution="&copy; Stadia Maps"
        />
        <FlyToSelected center={selectedTrip ? null : mapCenter} />
        <FlyToRoute trip={selectedTrip} />

        {/* Відмальовуємо лінію маршруту через Routing + Polyline */}
        {routeCoords.length > 1 && (
          <Suspense fallback={null}>
            <Routing points={routeCoords} transportType={transportType} />
          </Suspense>
        )}
        {routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#1976d2', weight: 4, opacity: 0.85 }}
          />
        )}

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
          iconCreateFunction={createClusterCustomIcon}
        >
          {locations
            .filter((loc) => loc.lat != null && loc.lon != null)
            .map((loc) => (
              <Marker
                key={String(loc.id)}
                position={[loc.lat, loc.lon]}
                icon={createCustomIcon(loc.type)}
                eventHandlers={{
                  click: () => {
                    setSelectedLocation(loc);
                    setSelectedTrip(null);
                  },
                }}
              />
            ))}
        </MarkerClusterGroup>
      </MapContainer>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: { xs: 'auto', md: '100vh' },
        pt: '64px',
        overflow: { xs: 'visible', md: 'hidden' },
      }}
    >
      <style>{`
        .custom-cluster-icon {
          background: #ffffff;
          border: 2px solid #222222;
          border-radius: 50%;
          color: #222222;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
          transition: all 0.2s ease-in-out;
        }
        .custom-cluster-icon:hover {
          transform: scale(1.1);
          background: #f8f8f8;
          border-color: #000;
        }
        .custom-cluster-icon span {
          line-height: 1;
        }
      `}</style>
      {descriptionPanel}
      {mapPanel}
    </Box>
  );
};