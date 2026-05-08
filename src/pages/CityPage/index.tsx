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
import 'leaflet/dist/leaflet.css';
import { api } from '../../api/auth';
import { createCustomIcon } from '../MapPage/Map/icons';

interface LocationData {
  name: string;
  description: string;
  region: string;
  type: string;
  lat: number;
  lon: number;
  priority: number;
}

const UKRAINE_CENTER: [number, number] = [48.3794, 31.1656];

const FlyToLocation: React.FC<{ center: [number, number] | null }> = ({ center }) => {
  const map = useMap();
  const didFly = useRef(false);

  useEffect(() => {
    if (center && !didFly.current) {
      didFly.current = true;
      map.flyTo(center, 13, { animate: true, duration: 1.6 });
    }
  }, [map, center]);

  return null;
};

export const CityPage: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const [searchParams] = useSearchParams();
  const region = searchParams.get('region');
  const navigate = useNavigate();
  const navState = useLocation().state as { lat?: number; lng?: number } | null;
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (region) params.region = region;
        const { data } = await api.get('/locations/', { params });
        const match = (data as LocationData[]).find(
          (loc) => loc.name.toLowerCase() === cityName?.toLowerCase(),
        );
        setLocation(match ?? null);
      } catch {
        setLocation(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, [cityName, region]);

  const mapCenter: [number, number] | null =
    location
      ? [location.lat, location.lon]
      : navState?.lat && navState?.lng
        ? [navState.lat, navState.lng]
        : null;

  const descriptionPanel = (
    <Box
      sx={{
        width: { xs: '100%', md: '30%' },
        minWidth: { md: '280px' },
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
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          Back
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : location ? (
        <>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1.2 }}
          >
            {location.name}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={location.region} size="small" sx={{ fontSize: '11px' }} />
            <Chip label={location.type} size="small" color="primary" sx={{ fontSize: '11px' }} />
            <Chip
              label={`Priority ${location.priority}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '11px' }}
            />
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {location.description}
          </Typography>

          <Typography variant="caption" color="text.disabled" sx={{ mt: 'auto' }}>
            {location.lat.toFixed(4)}°N,&nbsp;{location.lon.toFixed(4)}°E
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
            No description found for this city yet.
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
        <FlyToLocation center={mapCenter} />
        {location && (
          <Marker
            position={[location.lat, location.lon]}
            icon={createCustomIcon(location.type)}
          />
        )}
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
      <style>{`footer { display: none !important; }`}</style>
      {descriptionPanel}
      {mapPanel}
    </Box>
  );
};
