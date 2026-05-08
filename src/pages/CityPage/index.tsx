import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../api/auth';
import { createCustomIcon } from '../MapPage/Map/icons';

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

export const CityPage: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const [searchParams] = useSearchParams();
  const region = searchParams.get('region');
  const navigate = useNavigate();
  const navState = useLocation().state as { lat?: number; lng?: number } | null;

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const mapCenter: [number, number] | null =
    selectedLocation
      ? [selectedLocation.lat, selectedLocation.lon]
      : navState?.lat && navState?.lng
        ? [navState.lat, navState.lng]
        : null;

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
        <FlyToSelected center={mapCenter} />

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
                  click: () => setSelectedLocation(loc),
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
        footer { display: none !important; }
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
