import { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  InputAdornment,
  TextField,
  IconButton,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Autocomplete,
  Button,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import PublicIcon from '@mui/icons-material/Public';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import { PageWrapper, PageTitle, SubTitle, PrimaryButton, SecondaryButton } from '../../style/common.tsx';
import { api } from '../../api/auth.ts';
import { AuthContext } from '../../context/AuthContext';
import { getCities } from '../../api/cities.ts';
import type { City } from '../../api/cities.ts';

interface LocationItem {
  id: string;
  name: string;
  region: string;
  type: string;
  lat: number;
  lng: number;
  description?: string;
  ownerId: number | null;
  isOwn: boolean;
}

type TransportType = 'car' | 'foot' | 'bike';

// ── helpers ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  landmark: 'Landmark',
  cafe: 'Café',
  park: 'Park',
  culture: 'Culture',
  stop: 'Stop',
  city: 'City',
};

const typeLabel = (t: string) => TYPE_LABELS[t] ?? t.charAt(0).toUpperCase() + t.slice(1);

// ── component ────────────────────────────────────────────────────────────────

export const ItineraryPage: React.FC = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // locations
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  // cities from DB
  const [cities, setCities] = useState<City[]>([]);

  // route builder
  const [selectedPoints, setSelectedPoints] = useState<LocationItem[]>([]);
  const [transport, setTransport] = useState<TransportType>('car');

  // filters
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState<City | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterOwner, setFilterOwner] = useState<'all' | 'my' | 'existing'>('all');

  // drag-and-drop
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragNode = useRef<number | null>(null);
  const routeListRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // block scroll during touch-drag
  useEffect(() => {
    const el = routeListRef.current;
    if (!el) return;
    const block = (e: TouchEvent) => { if (isDraggingRef.current) e.preventDefault(); };
    el.addEventListener('touchmove', block, { passive: false });
    return () => el.removeEventListener('touchmove', block);
  }, []);

  // restore state from navigation
  const location = useLocation();
  useEffect(() => {
    const state = location.state as any;
    if (Array.isArray(state?.selectedRoutePoints) && state.selectedRoutePoints.length > 0) {
      setSelectedPoints(state.selectedRoutePoints.map((point: any) => ({
        id: String(point.id),
        name: point.name || '',
        region: point.region || point.city || '',
        type: point.type || point.category || 'landmark',
        lat: point.lat ?? point.latitude ?? 0,
        lng: point.lng ?? point.longitude ?? 0,
        description: point.description || '',
        ownerId: point.owner_id ?? point.ownerId ?? null,
        isOwn: point.isOwn ?? false,
      })));
    }
    if (state?.transport) setTransport(state.transport as TransportType);
  }, [location.state]);

  // fetch cities from DB
  useEffect(() => {
    getCities()
      .then(setCities)
      .catch((err) => console.error('Failed to load cities:', err));
  }, []);

  // fetch locations — single request, use owner_id to classify
  useEffect(() => {
    const fetchLocations = async () => {
      setLocationsLoading(true);
      setLocationsError(null);
      try {
        const isAuthed = token && token !== 'null' && token !== 'undefined';
        const headers = isAuthed
          ? { Authorization: `Bearer ${token!.replace(/["']/g, '')}` }
          : {};

        const res = await api.get('/locations/', { headers });
        const currentUserId: number | null = user?.id ?? null;

        const locs: LocationItem[] = res.data.map((loc: any) => {
          const ownerId: number | null = loc.owner_id ?? null;
          return {
            id: String(loc.id),
            name: loc.name,
            region: loc.region ?? '',
            type: loc.type ?? 'landmark',
            lat: loc.lat,
            lng: loc.lon,
            description: loc.description ?? '',
            ownerId,
            // isOwn: true only when this location belongs to the logged-in user
            isOwn: currentUserId !== null && ownerId === currentUserId,
          };
        });

        setLocations(locs);
      } catch (err) {
        console.error('Failed to load locations:', err);
        setLocationsError('Failed to load locations. Please try again.');
      } finally {
        setLocationsLoading(false);
      }
    };
    fetchLocations();
  }, [token, user]);

  // derived filter data
  const allTypes = useMemo(
    () => [...new Set(locations.map((l) => l.type).filter(Boolean))].sort(),
    [locations],
  );

  const hasActiveFilters = Boolean(filterCity || filterType || filterOwner !== 'all' || search);

  const clearFilters = () => {
    setFilterCity(null);
    setFilterType('');
    setFilterOwner('all');
    setSearch('');
  };

  const filteredLocations = useMemo(() => {
    let result = locations;

    if (filterCity) {
      const cityName = filterCity.name.toLowerCase();
      result = result.filter((l) => l.region.toLowerCase().includes(cityName));
    }

    if (filterType) result = result.filter((l) => l.type === filterType);

    if (filterOwner === 'my') result = result.filter((l) => l.isOwn);
    // "existing" = developer-seeded locations with no user link (owner_id IS NULL)
    else if (filterOwner === 'existing') result = result.filter((l) => l.ownerId === null);

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.region.toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q),
      );
    }
    return result;
  }, [locations, search, filterCity, filterType, filterOwner]);

  // ── route helpers ──────────────────────────────────────────────────────────

  const isSelected = (id: string) => selectedPoints.some((p) => p.id === id);

  const togglePoint = (loc: LocationItem) => {
    setSelectedPoints((prev) =>
      isSelected(loc.id) ? prev.filter((p) => p.id !== loc.id) : [...prev, loc],
    );
  };

  const removePoint = (id: string) =>
    setSelectedPoints((prev) => prev.filter((p) => p.id !== id));

  // ── drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = (idx: number) => { dragNode.current = idx; setDraggingIdx(idx); };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragNode.current !== null && dragNode.current !== idx) setDragOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = dragNode.current;
    if (fromIdx === null || fromIdx === toIdx) { setDraggingIdx(null); setDragOverIdx(null); dragNode.current = null; return; }
    setSelectedPoints((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      return updated;
    });
    dragNode.current = null; setDraggingIdx(null); setDragOverIdx(null);
  };

  const handleDragEnd = () => { dragNode.current = null; setDraggingIdx(null); setDragOverIdx(null); };

  const handleTouchStart = (idx: number) => { isDraggingRef.current = true; dragNode.current = idx; setDraggingIdx(idx); };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const item = el?.closest('[data-route-idx]') as HTMLElement | null;
    if (!item) return;
    const idx = parseInt(item.dataset.routeIdx ?? '-1', 10);
    if (!isNaN(idx) && idx !== dragNode.current) setDragOverIdx(idx);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    const fromIdx = dragNode.current;
    setSelectedPoints((prev) => {
      if (fromIdx === null || dragOverIdx === null || fromIdx === dragOverIdx) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(dragOverIdx, 0, moved);
      return updated;
    });
    dragNode.current = null; setDraggingIdx(null); setDragOverIdx(null);
  };

  const handleViewOnMap = () => {
    if (selectedPoints.length === 0) return;
    navigate('/map-page', {
      state: {
        initialRoutePoints: selectedPoints.map((loc) => ({
          id: loc.id,
          name: loc.name,
          category: (loc.type ?? 'landmark') as any,
          priority: 3 as const,
          description: loc.description ?? '',
          lat: loc.lat,
          lng: loc.lng,
        })),
        transport,
      },
    });
  };

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      <Box sx={{ maxWidth: '1100px', margin: '0 auto', px: 3 }}>
        <SubTitle>Plan Your Journey</SubTitle>
        <PageTitle sx={{ mb: 1 }}>Build Trip</PageTitle>
        <Typography sx={{ color: '#666', mb: 4, fontSize: '0.95rem' }}>
          Select points from the list and build your trip. Click "Show Trip" to see it on the map.
        </Typography>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}>
          {/* ── Left: Locations ──────────────────────────────────────────────── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SubTitle>Available Locations</SubTitle>

            {/* ── Filter Panel ─────────────────────────────────────────────── */}
            <Box
              sx={{
                bgcolor: '#f8f8f8',
                border: '1px solid #ebebeb',
                borderRadius: '12px',
                p: { xs: 2, sm: 2.5 },
                mb: 2.5,
              }}
            >
              {/* Panel header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TuneIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#666' }}>
                    Filters
                  </Typography>
                </Box>
                {hasActiveFilters && (
                  <Button
                    size="small"
                    onClick={clearFilters}
                    startIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: '#888',
                      p: '2px 8px',
                      minWidth: 0,
                      borderRadius: '6px',
                      '&:hover': { bgcolor: '#ebebeb', color: '#333' },
                    }}
                  >
                    Reset
                  </Button>
                )}
              </Box>

              {/* Search */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, region or type…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: '#fff',
                    '& fieldset': { borderColor: '#e0e0e0' },
                    '&:hover fieldset': { borderColor: '#aaa' },
                    '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: '1.5px' },
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: '#bbb' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* City + Type row */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                {/* City Autocomplete from DB */}
                <Autocomplete<City>
                  options={cities}
                  getOptionLabel={(option) => option.name}
                  value={filterCity}
                  onChange={(_, newValue) => setFilterCity(newValue)}
                  size="small"
                  sx={{ flex: '1 1 160px', minWidth: 140 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="City"
                      placeholder="All cities"
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <LocationCityIcon sx={{ fontSize: 16, color: '#bbb' }} />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          bgcolor: '#fff',
                          '& fieldset': { borderColor: '#e0e0e0' },
                          '&:hover fieldset': { borderColor: '#aaa' },
                          '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: '1.5px' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#000' },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ fontSize: '0.83rem', py: '6px !important' }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, lineHeight: 1.2 }}>
                          {option.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>
                          {option.region}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText="No cities found"
                  loadingText="Loading…"
                />

                {/* Type chips row */}
                <Box
                  sx={{
                    flex: '2 1 220px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    flexWrap: 'wrap',
                  }}
                >
                  <Chip
                    label="All types"
                    size="small"
                    onClick={() => setFilterType('')}
                    sx={{
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: filterType === '' ? 700 : 500,
                      bgcolor: filterType === '' ? '#000' : '#fff',
                      color: filterType === '' ? '#fff' : '#555',
                      border: '1px solid',
                      borderColor: filterType === '' ? '#000' : '#ddd',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: filterType === '' ? '#333' : '#f0f0f0' },
                    }}
                  />
                  {allTypes.map((t) => (
                    <Chip
                      key={t}
                      label={typeLabel(t)}
                      size="small"
                      onClick={() => setFilterType(filterType === t ? '' : t)}
                      sx={{
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: filterType === t ? 700 : 500,
                        bgcolor: filterType === t ? '#000' : '#fff',
                        color: filterType === t ? '#fff' : '#555',
                        border: '1px solid',
                        borderColor: filterType === t ? '#000' : '#ddd',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        '&:hover': { bgcolor: filterType === t ? '#333' : '#f0f0f0' },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Owner toggle */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {([
                  { value: 'all', label: 'All locations', Icon: null },
                  { value: 'existing', label: 'Existing', Icon: PublicIcon },
                  { value: 'my', label: 'My locations', Icon: PersonPinIcon },
                ] as const).map(({ value, label, Icon }) => (
                  <Box
                    key={value}
                    onClick={() => setFilterOwner(value)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: '8px',
                      border: '1.5px solid',
                      borderColor: filterOwner === value ? '#000' : '#ddd',
                      bgcolor: filterOwner === value ? '#000' : '#fff',
                      color: filterOwner === value ? '#fff' : '#555',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: filterOwner === value ? 700 : 500,
                      letterSpacing: '0.5px',
                      transition: 'all 0.15s',
                      userSelect: 'none',
                      '&:hover': {
                        borderColor: filterOwner === value ? '#333' : '#999',
                        bgcolor: filterOwner === value ? '#333' : (theme: any) => alpha('#000', 0.04),
                      },
                    }}
                  >
                    {Icon && <Icon sx={{ fontSize: 14 }} />}
                    {label}
                  </Box>
                ))}
              </Box>

              {/* Active filter count badge */}
              {hasActiveFilters && (
                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#999' }}>
                    Showing <strong style={{ color: '#000' }}>{filteredLocations.length}</strong> of {locations.length} locations
                  </Typography>
                </Box>
              )}
            </Box>

            {/* ── Locations list ────────────────────────────────────────────── */}
            {locationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={28} />
              </Box>
            ) : locationsError ? (
              <Typography sx={{ color: 'error.main' }}>{locationsError}</Typography>
            ) : filteredLocations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <SearchIcon sx={{ fontSize: 40, color: '#ddd', mb: 1 }} />
                <Typography sx={{ fontSize: '0.9rem' }}>No results found.</Typography>
                {hasActiveFilters && (
                  <Button size="small" onClick={clearFilters} sx={{ mt: 1, fontSize: '0.78rem', color: '#888', textTransform: 'none' }}>
                    Clear filters
                  </Button>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  maxHeight: '520px',
                  overflowY: 'auto',
                  border: '1px solid #ebebeb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <List disablePadding>
                  {filteredLocations.map((loc, idx) => (
                    <ListItem
                      key={loc.id}
                      sx={{
                        borderBottom: idx < filteredLocations.length - 1 ? '1px solid #f4f4f4' : 'none',
                        bgcolor: isSelected(loc.id) ? '#f6f6f6' : 'transparent',
                        transition: 'background 0.15s',
                        py: 1.5,
                        pr: 1,
                        '&:hover': { bgcolor: isSelected(loc.id) ? '#f0f0f0' : '#fafafa' },
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => togglePoint(loc)}
                          sx={{
                            width: 32,
                            height: 32,
                            border: '1.5px solid',
                            borderColor: isSelected(loc.id) ? '#000' : '#d0d0d0',
                            borderRadius: '8px',
                            color: isSelected(loc.id) ? '#fff' : '#555',
                            bgcolor: isSelected(loc.id) ? '#000' : 'transparent',
                            transition: 'all 0.15s',
                            '&:hover': {
                              bgcolor: isSelected(loc.id) ? '#333' : '#f0f0f0',
                              borderColor: isSelected(loc.id) ? '#333' : '#999',
                            },
                          }}
                        >
                          {isSelected(loc.id)
                            ? <RemoveIcon sx={{ fontSize: 16 }} />
                            : <AddIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', pr: 1 }}>
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                              {loc.name}
                            </Typography>
                            {loc.isOwn && (
                              <Chip
                                label="My"
                                size="small"
                                icon={<PersonPinIcon sx={{ fontSize: '11px !important' }} />}
                                variant="outlined"
                                sx={{ fontSize: '0.62rem', height: 18, borderRadius: '4px', borderColor: '#bbb', color: '#888' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                            <Chip
                              label={loc.region}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 18, borderRadius: '4px', bgcolor: '#f0f0f0', color: '#555' }}
                            />
                            <Chip
                              label={typeLabel(loc.type)}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.65rem', height: 18, borderRadius: '4px', borderColor: '#ddd', color: '#777' }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          {/* ── Right: Route builder ──────────────────────────────────────── */}
          <Box
            sx={{
              width: { xs: '100%', md: '340px' },
              flexShrink: 0,
              position: { xs: 'static', md: 'sticky' },
              top: '100px',
            }}
          >
            <SubTitle>Your Trip</SubTitle>

            {selectedPoints.length === 0 ? (
              <Box
                sx={{
                  border: '2px dashed #e0e0e0',
                  borderRadius: '12px',
                  py: 5,
                  px: 3,
                  textAlign: 'center',
                  color: 'text.secondary',
                  mb: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <DragIndicatorIcon sx={{ fontSize: 32, color: '#ccc' }} />
                <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>
                  Select points from the list on the left
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>
                  to add them to your trip.
                </Typography>
              </Box>
            ) : (
              <Box
                ref={routeListRef}
                sx={{
                  border: '1px solid #ebebeb',
                  borderRadius: '12px',
                  mb: 3,
                  maxHeight: '400px',
                  overflowY: 'auto',
                  userSelect: 'none',
                }}
              >
                <List disablePadding>
                  {selectedPoints.map((point, idx) => (
                    <ListItem
                      key={point.id}
                      data-route-idx={idx}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={() => handleTouchStart(idx)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      sx={{
                        borderBottom: idx < selectedPoints.length - 1 ? '1px solid #f4f4f4' : 'none',
                        borderTop: dragOverIdx === idx && draggingIdx !== idx ? '2px solid #000' : '2px solid transparent',
                        py: 1.5,
                        pr: 1,
                        opacity: draggingIdx === idx ? 0.35 : 1,
                        bgcolor: dragOverIdx === idx && draggingIdx !== idx ? '#fafafa' : 'transparent',
                        cursor: 'grab',
                        transition: 'opacity 0.15s, background 0.1s',
                        '&:active': { cursor: 'grabbing' },
                        touchAction: 'none',
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          size="small"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => removePoint(point.id)}
                          sx={{ color: '#ccc', '&:hover': { color: '#e53935' }, cursor: 'pointer' }}
                        >
                          <RemoveIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      }
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#bbb', minWidth: 18, textAlign: 'center' }}>
                          {idx + 1}
                        </Typography>
                        <DragIndicatorIcon sx={{ fontSize: 18, color: '#ccc' }} />
                      </Box>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {point.name}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {point.region}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            <SubTitle sx={{ mb: 1 }}>Transport Type</SubTitle>
            <ToggleButtonGroup
              value={transport}
              exclusive
              onChange={(_, val) => val && setTransport(val)}
              size="small"
              sx={{
                mb: 3,
                '& .MuiToggleButton-root': {
                  borderRadius: '8px !important',
                  px: 2,
                  py: 1,
                  border: '1.5px solid #e0e0e0 !important',
                  mx: 0.5,
                  '&.Mui-selected': {
                    bgcolor: '#000',
                    color: '#fff',
                    borderColor: '#000 !important',
                    '&:hover': { bgcolor: '#333' },
                  },
                },
              }}
            >
              <ToggleButton value="car">
                <DirectionsCarIcon sx={{ fontSize: 18, mr: 0.5 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Car
                </Typography>
              </ToggleButton>
              <ToggleButton value="foot">
                <DirectionsWalkIcon sx={{ fontSize: 18, mr: 0.5 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Walk
                </Typography>
              </ToggleButton>
              <ToggleButton value="bike">
                <DirectionsBikeIcon sx={{ fontSize: 18, mr: 0.5 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Bike
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>

            <Stack spacing={2}>
              <PrimaryButton
                onClick={handleViewOnMap}
                disabled={selectedPoints.length < 2}
                sx={{ width: '100%', opacity: selectedPoints.length < 2 ? 0.6 : 1, cursor: selectedPoints.length < 2 ? 'not-allowed' : 'pointer', color: selectedPoints.length < 2 ? '#999' : '#fff', bgcolor: selectedPoints.length < 2 ? '#ccc' : '#000', '&:hover': { bgcolor: selectedPoints.length < 2 ? '#ccc' : '#333' } }} 
              >
                Show Trip ({selectedPoints.length} points)
              </PrimaryButton>
              {selectedPoints.length < 2 && (
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center' }}>
                  Add at least 2 points to build a route
                </Typography>
              )}
              <SecondaryButton
                variant="outlined"
                onClick={() => navigate('/account?showItinerary=1')}
                sx={{ width: '100%' }}
              >
                Back to My Trips
              </SecondaryButton>
            </Stack>
          </Box>
        </Box>
      </Box>
    </PageWrapper>
  );
};
