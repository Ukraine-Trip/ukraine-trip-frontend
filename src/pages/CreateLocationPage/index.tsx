import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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
} from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';
import {
  PageWrapper,
  PageTitle,
  SubTitle,
  CommonInput,
  PrimaryButton,
} from '../../style/common.tsx';
import { api } from '../../api/auth.ts';
import { AuthContext } from '../../context/AuthContext';

const UKRAINE_REGIONS = [
  'Vinnytsia Oblast',
  'Volyn Oblast',
  'Dnipropetrovsk Oblast',
  'Donetsk Oblast',
  'Zhytomyr Oblast',
  'Zakarpattia Oblast',
  'Zaporizhzhia Oblast',
  'Ivano-Frankivsk Oblast',
  'Kyiv Oblast',
  'Kirovohrad Oblast',
  'Luhansk Oblast',
  'Lviv Oblast',
  'Mykolaiv Oblast',
  'Odesa Oblast',
  'Poltava Oblast',
  'Rivne Oblast',
  'Sumy Oblast',
  'Ternopil Oblast',
  'Kharkiv Oblast',
  'Kherson Oblast',
  'Khmelnytskyi Oblast',
  'Cherkasy Oblast',
  'Chernivtsi Oblast',
  'Chernihiv Oblast',
  'Kyiv City',
];

const LOCATION_TYPES = [
  { value: 'city', label: 'City' },
  { value: 'landmark', label: 'Landmark' },
  { value: 'park', label: 'Park' },
  { value: 'culture', label: 'Culture' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'stop', label: 'Stop' },
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

interface LocationPickerProps {
  onSelect: (lat: number, lng: number) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
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

  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(null);
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

  const handleSubmit = async () => {
    if (!selectedPos) {
      setError('Please select a location on the map');
      return;
    }
    if (!form.name.trim()) {
      setError('Place name is required');
      return;
    }
    if (!form.region) {
      setError('Please select a region');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post(
        '/locations/',
        {
          name: form.name,
          description: form.description,
          region: form.region,
          type: form.type,
          lat: selectedPos.lat,
          lon: selectedPos.lng,
          priority: form.priority,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => navigate(`/map-page?lat=${selectedPos.lat}&lng=${selectedPos.lng}&zoom=15`), 1800);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Box sx={{ maxWidth: '900px', margin: '0 auto', px: 3 }}>
        <SubTitle>Contribute</SubTitle>
        <PageTitle>Create Place</PageTitle>

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
          {!selectedPos && (
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
                Click on the map to select location
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
            <LocationPicker onSelect={(lat, lng) => setSelectedPos({ lat, lng })} />
            {selectedPos && <Marker position={[selectedPos.lat, selectedPos.lng]} icon={pinIcon} />}
          </MapContainer>
        </Box>

        {/* Selected location badge */}
        {selectedPos && (
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
            <RoomIcon sx={{ color: '#1565C0', fontSize: '1.4rem', flexShrink: 0 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Selected location</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#777', fontFamily: 'monospace' }}>
                {selectedPos.lat.toFixed(4)}, {selectedPos.lng.toFixed(4)}
              </Typography>
            </Box>
            <Typography
              onClick={() => setSelectedPos(null)}
              sx={{
                fontSize: '0.75rem',
                color: '#1565C0',
                cursor: 'pointer',
                fontWeight: 600,
                flexShrink: 0,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Adjust marker
            </Typography>
          </Box>
        )}

        {/* Form */}
        <Stack spacing={3}>
          <Box>
            <SubTitle>
              Place Name <span style={{ color: '#e53935' }}>*</span>
            </SubTitle>
            <CommonInput
              fullWidth
              placeholder="Enter place name"
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
              placeholder="Describe this place..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value.slice(0, 300) })
              }
              helperText={`${form.description.length}/300`}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <SubTitle>
                Region <span style={{ color: '#e53935' }}>*</span>
              </SubTitle>
              <FormControl fullWidth>
                <Select
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  displayEmpty
                  sx={selectSx}
                >
                  <MenuItem value="" disabled>
                    <em style={{ color: '#aaa', fontStyle: 'normal' }}>Select region</em>
                  </MenuItem>
                  {UKRAINE_REGIONS.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1 }}>
              <SubTitle>Type</SubTitle>
              <FormControl fullWidth>
                <Select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  sx={selectSx}
                >
                  {LOCATION_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1 }}>
              <SubTitle>Priority</SubTitle>
              <FormControl fullWidth>
                <Select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                  sx={selectSx}
                >
                  {[1, 2, 3, 4, 5].map((p) => (
                    <MenuItem key={p} value={p}>
                      {p} {p === 1 ? '— High' : p === 5 ? '— Low' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 0 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ pt: 1 }}>
            <PrimaryButton onClick={handleSubmit} disabled={loading} fullWidth>
              {loading ? 'Creating...' : 'Create Place'}
            </PrimaryButton>
          </Box>
        </Stack>
      </Box>

      <Snackbar
        open={success}
        message="Place created successfully! Redirecting..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </PageWrapper>
  );
};
