import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  Typography,
  Stack,
  MenuItem,
  Select,
  FormControl,
  Alert,
  Snackbar,
  Button
} from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';
import {
  PageWrapper,
  PageTitle,
  SubTitle,
  CommonInput,
  PrimaryButton,
} from '../../style/common.tsx';
import { api } from '../../api/auth.ts';
import { AuthContext } from '../../context/AuthContext';

// ... (UKRAINE_REGIONS та LOCATION_TYPES залишаються без змін)
const UKRAINE_REGIONS = [
  'Vinnytsia Oblast', 'Volyn Oblast', 'Dnipropetrovsk Oblast', 'Donetsk Oblast',
  'Zhytomyr Oblast', 'Zakarpattia Oblast', 'Zaporizhzhia Oblast', 'Ivano-Frankivsk Oblast',
  'Kyiv Oblast', 'Kirovohrad Oblast', 'Luhansk Oblast', 'Lviv Oblast',
  'Mykolaiv Oblast', 'Odesa Oblast', 'Poltava Oblast', 'Rivne Oblast',
  'Sumy Oblast', 'Ternopil Oblast', 'Kharkiv Oblast', 'Kherson Oblast',
  'Khmelnytskyi Oblast', 'Cherkasy Oblast', 'Chernivtsi Oblast', 'Chernihiv Oblast',
  'Kyiv City',
];

const LOCATION_TYPES = [
  { value: 'city', label: 'City' }, { value: 'landmark', label: 'Landmark' },
  { value: 'park', label: 'Park' }, { value: 'culture', label: 'Culture' },
  { value: 'cafe', label: 'Cafe' }, { value: 'stop', label: 'Stop' },
];

const pinIcon = L.divIcon({
  html: `<div style="
    width: 28px;
    height: 28px;
    background: #1565C0;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2.5px solid white;
    box-shadow: 0 3px 10px rgba(0,0,0,0.35);
  "></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const ukraineBounds: L.LatLngBoundsLiteral = [
  [44.3863, 22.1372], // Southwest
  [52.3791, 40.2277], // Northeast
];

interface RoutePickerProps {
  onAddPoint: (lat: number, lng: number) => void;
}

// Компонент для обробки кліків по мапі
const RoutePicker: React.FC<RoutePickerProps> = ({ onAddPoint }) => {
  const map = useMapEvents({
    click(e) {
      const bounds = L.latLngBounds(ukraineBounds);
      if (bounds.contains(e.latlng)) {
        onAddPoint(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  useEffect(() => {
    map.setMaxBounds(L.latLngBounds(ukraineBounds));
  }, [map]);

  return null;
};

const selectSx = {
  borderRadius: 0,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
};

export const CreateLocationPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Стейт для зберігання всіх вибраних точок (waypoints)
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  // Стейт для зберігання геометрії маршруту з API
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    region: '',
    type: 'landmark',
    priority: 3,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функція для запиту до OSRM API
  useEffect(() => {
    const fetchRoute = async () => {
      if (waypoints.length < 2) {
        setRouteGeometry([]);
        return;
      }

      try {
        // OSRM приймає координати у форматі "lon,lat;lon,lat"
        const coordinatesString = waypoints.map(wp => `${wp[1]},${wp[0]}`).join(';');
        
        // Звертаємось до публічного OSRM API (маршрут для авто: driving)
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.code === 'Ok' && data.routes.length > 0) {
          // OSRM повертає координати як [lon, lat], а Leaflet потребує [lat, lon]
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          setRouteGeometry(coords);
        }
      } catch (err) {
        console.error("Failed to fetch route API", err);
        setError("Помилка при побудові маршруту через API.");
      }
    };

    fetchRoute();
  }, [waypoints]);

  const handleAddPoint = (lat: number, lng: number) => {
    setWaypoints(prev => [...prev, [lat, lng]]);
  };

  const handleClearRoute = () => {
    setWaypoints([]);
    setRouteGeometry([]);
  };

  const handleSubmit = async () => {
    if (waypoints.length === 0) {
      setError('Please select at least one location on the map');
      return;
    }
    if (!form.name.trim()) {
      setError('Place/Route name is required');
      return;
    }
    if (!form.region) {
      setError('Please select a region');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Тут логіка відправки масиву точок на ВАШ бекенд.
      // Залежно від вашої API, ви можете надсилати waypoints або routeGeometry
      await api.post(
        '/routes/', // Замінив endpoint, оскільки тепер це маршрут
        {
          name: form.name,
          description: form.description,
          region: form.region,
          type: form.type,
          waypoints: waypoints, // відправляємо масив координат
          priority: form.priority,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => navigate('/account?showLocations=1'), 1800);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Box sx={{ maxWidth: '900px', margin: '0 auto', px: 3 }}>
        <SubTitle>Contribute</SubTitle>
        <PageTitle>Create Route</PageTitle>

        {/* Map */}
        <Box
          sx={{
            width: '100%',
            height: { xs: '280px', md: '420px' },
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
            mb: 3,
            mt: 2,
            position: 'relative',
          }}
        >
          {waypoints.length === 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 14,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                bgcolor: 'white',
                px: 2.5,
                py: 1,
                borderRadius: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#444', letterSpacing: '0.5px' }}>
                Click on the map to start building a route
              </Typography>
            </Box>
          )}

          <MapContainer
            center={[48.3794, 31.1656]}
            zoom={6}
            zoomControl={true}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
              attribution="&copy; Stadia Maps"
            />
            <RoutePicker onAddPoint={handleAddPoint} />
            
            {/* Малюємо всі вибрані маркери */}
            {waypoints.map((pos, idx) => (
              <Marker key={idx} position={pos} icon={pinIcon} />
            ))}

            {/* Відмальовуємо маршрут від API */}
            {routeGeometry.length > 1 && (
              <Polyline positions={routeGeometry} pathOptions={{ color: '#1565C0', weight: 4 }} />
            )}
          </MapContainer>
        </Box>

        {/* Інформація про маршрут */}
        {waypoints.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 3,
              p: 2,
              bgcolor: '#f5f8ff',
              border: '1px solid #d0dff5',
              borderRadius: '4px',
            }}
          >
            <RouteIcon sx={{ color: '#1565C0', fontSize: '1.4rem', flexShrink: 0 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {waypoints.length} points selected
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#777' }}>
                {routeGeometry.length > 0 ? "Route generated successfully" : "Add more points to build a route"}
              </Typography>
            </Box>
            <Button
              size="small"
              color="error"
              onClick={handleClearRoute}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Clear Route
            </Button>
          </Box>
        )}

        {/* Форма залишається майже без змін, лише адаптована під відправку масиву точок */}
        <Stack spacing={3}>
          <Box>
            <SubTitle>Route Name <span style={{ color: '#e53935' }}>*</span></SubTitle>
            <CommonInput
              fullWidth
              placeholder="Enter route name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Box>

          <Box>
            <SubTitle>Description</SubTitle>
            <CommonInput
              fullWidth
              multiline
              rows={4}
              placeholder="Describe this route..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 300) })}
              helperText={`${form.description.length}/300`}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <SubTitle>Region <span style={{ color: '#e53935' }}>*</span></SubTitle>
              <FormControl fullWidth>
                <Select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} displayEmpty sx={selectSx}>
                  <MenuItem value="" disabled><em style={{ color: '#aaa', fontStyle: 'normal' }}>Select region</em></MenuItem>
                  {UKRAINE_REGIONS.map((r) => (<MenuItem key={r} value={r}>{r}</MenuItem>))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1 }}>
              <SubTitle>Type</SubTitle>
              <FormControl fullWidth>
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} sx={selectSx}>
                  {LOCATION_TYPES.map((t) => (<MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1 }}>
              <SubTitle>Priority</SubTitle>
              <FormControl fullWidth>
                <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} sx={selectSx}>
                  {[1, 2, 3, 4, 5].map((p) => (<MenuItem key={p} value={p}>{p} {p === 1 ? '— High' : p === 5 ? '— Low' : ''}</MenuItem>))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ borderRadius: 0 }}>{error}</Alert>}

          <Box sx={{ pt: 1 }}>
            <PrimaryButton onClick={handleSubmit} disabled={loading || waypoints.length === 0} fullWidth>
              {loading ? 'Saving...' : 'Create Route'}
            </PrimaryButton>
          </Box>
        </Stack>
      </Box>

      <Snackbar open={success} message="Route created successfully! Redirecting..." anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </PageWrapper>
  );
};