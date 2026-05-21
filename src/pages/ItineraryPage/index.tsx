import { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { PageWrapper, PageTitle, SubTitle, PrimaryButton, SecondaryButton } from '../../style/common.tsx';
import { api } from '../../api/auth.ts';
import { AuthContext } from '../../context/AuthContext';

interface LocationItem {
  id: string;
  name: string;
  region: string;
  type: string;
  lat: number;
  lng: number;
  description?: string;
  isOwn?: boolean;
}

type TransportType = 'car' | 'foot' | 'bike';

export const ItineraryPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  const [selectedPoints, setSelectedPoints] = useState<LocationItem[]>([]);
  const [search, setSearch] = useState('');
  const [transport, setTransport] = useState<TransportType>('car');
  const [filterRegion, setFilterRegion] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterOwner, setFilterOwner] = useState<'all' | 'my' | 'public'>('all');

  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragNode = useRef<number | null>(null);
  const routeListRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Non-passive touchmove so we can preventDefault and block page scroll during drag
  useEffect(() => {
    const el = routeListRef.current;
    if (!el) return;
    const block = (e: TouchEvent) => { if (isDraggingRef.current) e.preventDefault(); };
    el.addEventListener('touchmove', block, { passive: false });
    return () => el.removeEventListener('touchmove', block);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      setLocationsLoading(true);
      setLocationsError(null);
      try {
        const publicReq = api.get('/locations/');
        const myReq = (token && token !== 'null' && token !== 'undefined')
          ? api.get('/locations/', {
              params: { filter_type: 'my' },
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null);

        const [publicResult, myResult] = await Promise.allSettled([publicReq, myReq]);

        let publicLocs: LocationItem[] = [];
        if (publicResult.status === 'fulfilled' && publicResult.value) {
          publicLocs = publicResult.value.data.map((loc: any) => ({
            id: String(loc.id),
            name: loc.name,
            region: loc.region ?? '',
            type: loc.type ?? 'landmark',
            lat: loc.lat,
            lng: loc.lon,
            description: loc.description ?? '',
          }));
        }

        let myLocs: LocationItem[] = [];
        if (myResult.status === 'fulfilled' && myResult.value) {
          myLocs = myResult.value.data.map((loc: any) => ({
            id: String(loc.id),
            name: loc.name,
            region: loc.region ?? '',
            type: loc.type ?? 'landmark',
            lat: loc.lat,
            lng: loc.lon,
            description: loc.description ?? '',
            isOwn: true,
          }));
        }

        const publicIds = new Set(publicLocs.map((l) => l.id));
        const uniqueMyLocs = myLocs.filter((l) => !publicIds.has(l.id));
        setLocations([...publicLocs, ...uniqueMyLocs]);
      } catch (err) {
        console.error('Помилка завантаження локацій:', err);
        setLocationsError('Не вдалося завантажити точки');
      } finally {
        setLocationsLoading(false);
      }
    };
    fetchLocations();
  }, [token]);

  const allRegions = useMemo(
    () => [...new Set(locations.map((l) => l.region).filter(Boolean))].sort(),
    [locations],
  );

  const allTypes = useMemo(
    () => [...new Set(locations.map((l) => l.type).filter(Boolean))].sort(),
    [locations],
  );

  const filteredLocations = useMemo(() => {
    let result = locations;

    if (filterRegion) result = result.filter((l) => l.region === filterRegion);
    if (filterType) result = result.filter((l) => l.type === filterType);
    if (filterOwner === 'my') result = result.filter((l) => l.isOwn);
    else if (filterOwner === 'public') result = result.filter((l) => !l.isOwn);

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
  }, [locations, search, filterRegion, filterType, filterOwner]);

  const isSelected = (id: string) => selectedPoints.some((p) => p.id === id);

  const togglePoint = (loc: LocationItem) => {
    if (isSelected(loc.id)) {
      setSelectedPoints((prev) => prev.filter((p) => p.id !== loc.id));
    } else {
      setSelectedPoints((prev) => [...prev, loc]);
    }
  };

  const removePoint = (id: string) => {
    setSelectedPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDragStart = (idx: number) => {
    dragNode.current = idx;
    setDraggingIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragNode.current !== null && dragNode.current !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = dragNode.current;
    if (fromIdx === null || fromIdx === toIdx) {
      setDraggingIdx(null);
      setDragOverIdx(null);
      dragNode.current = null;
      return;
    }
    setSelectedPoints((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      return updated;
    });
    dragNode.current = null;
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    dragNode.current = null;
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleTouchStart = (idx: number) => {
    isDraggingRef.current = true;
    dragNode.current = idx;
    setDraggingIdx(idx);
  };

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
    dragNode.current = null;
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleViewOnMap = () => {
    if (selectedPoints.length === 0) return;

    const routePoints = selectedPoints.map((loc) => ({
      id: loc.id,
      name: loc.name,
      category: (loc.type ?? 'landmark') as any,
      priority: 3 as const,
      description: loc.description ?? '',
      lat: loc.lat,
      lng: loc.lng,
    }));

    navigate('/map-page', {
      state: {
        initialRoutePoints: routePoints,
        transport,
      },
    });
  };

  return (
    <PageWrapper>
      <Box sx={{ maxWidth: '1100px', margin: '0 auto', px: 3 }}>
        <SubTitle>Plan Your Journey</SubTitle>
        <PageTitle sx={{ mb: 1 }}>Build Itinerary</PageTitle>
        <Typography sx={{ color: '#666', mb: 4, fontSize: '0.95rem' }}>
          Оберіть точки зі списку та побудуйте свій маршрут. Натисніть «View on Map», щоб побачити маршрут на карті.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 4,
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'flex-start',
          }}
        >
          {/* Left: Locations list */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SubTitle>Available Locations</SubTitle>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel sx={{ fontSize: '0.8rem' }}>City</InputLabel>
                <Select
                  value={filterRegion}
                  label="City"
                  onChange={(e) => setFilterRegion(e.target.value)}
                  sx={{ borderRadius: 0, fontSize: '0.8rem' }}
                >
                  <MenuItem value="">All cities</MenuItem>
                  {allRegions.map((r) => (
                    <MenuItem key={r} value={r} sx={{ fontSize: '0.8rem' }}>{r}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ fontSize: '0.8rem' }}>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{ borderRadius: 0, fontSize: '0.8rem' }}
                >
                  <MenuItem value="">All types</MenuItem>
                  {allTypes.map((t) => (
                    <MenuItem key={t} value={t} sx={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                {(['all', 'public', 'my'] as const).map((v) => (
                  <Chip
                    key={v}
                    label={v === 'all' ? 'All' : v === 'my' ? 'My locations' : 'Existing'}
                    size="small"
                    onClick={() => setFilterOwner(v)}
                    variant={filterOwner === v ? 'filled' : 'outlined'}
                    sx={{
                      borderRadius: 0,
                      fontSize: '0.72rem',
                      fontWeight: filterOwner === v ? 700 : 400,
                      bgcolor: filterOwner === v ? '#000' : 'transparent',
                      color: filterOwner === v ? '#fff' : '#000',
                      borderColor: '#000',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: filterOwner === v ? '#333' : '#f5f5f5' },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, region or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  '& fieldset': { borderColor: '#e0e0e0' },
                  '&:hover fieldset': { borderColor: '#000' },
                  '&.Mui-focused fieldset': { borderColor: '#000' },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: '#999' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {locationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={28} />
              </Box>
            ) : locationsError ? (
              <Typography sx={{ color: 'error.main' }}>{locationsError}</Typography>
            ) : filteredLocations.length === 0 ? (
              <Typography sx={{ color: 'text.secondary' }}>Нічого не знайдено.</Typography>
            ) : (
              <Box
                sx={{
                  maxHeight: '520px',
                  overflowY: 'auto',
                  border: '1px solid #eee',
                  borderRadius: 0,
                }}
              >
                <List disablePadding>
                  {filteredLocations.map((loc, idx) => (
                    <ListItem
                      key={loc.id}
                      sx={{
                        borderBottom: idx < filteredLocations.length - 1 ? '1px solid #f0f0f0' : 'none',
                        bgcolor: isSelected(loc.id) ? '#f8f8f8' : 'transparent',
                        transition: 'background 0.15s',
                        py: 1.5,
                        pr: 1,
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => togglePoint(loc)}
                          sx={{
                            border: '1px solid',
                            borderColor: isSelected(loc.id) ? '#000' : '#ccc',
                            borderRadius: 0,
                            color: isSelected(loc.id) ? '#fff' : '#000',
                            bgcolor: isSelected(loc.id) ? '#000' : 'transparent',
                            '&:hover': {
                              bgcolor: isSelected(loc.id) ? '#333' : '#f5f5f5',
                            },
                            width: 30,
                            height: 30,
                          }}
                        >
                          {isSelected(loc.id) ? <RemoveIcon sx={{ fontSize: 16 }} /> : <AddIcon sx={{ fontSize: 16 }} />}
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
                              <Chip label="My location" size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                            <Chip label={loc.region} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                            <Chip label={loc.type} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          {/* Right: Route builder */}
          <Box
            sx={{
              width: { xs: '100%', md: '340px' },
              flexShrink: 0,
              position: { xs: 'static', md: 'sticky' },
              top: '100px',
            }}
          >
            <SubTitle>Your Route</SubTitle>

            {selectedPoints.length === 0 ? (
              <Box
                sx={{
                  border: '2px dashed #e0e0e0',
                  borderRadius: 0,
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
                  Оберіть точки зі списку зліва,
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>
                  щоб додати їх до маршруту.
                </Typography>
              </Box>
            ) : (
              <Box
                ref={routeListRef}
                sx={{
                  border: '1px solid #eee',
                  borderRadius: 0,
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
                        borderBottom: idx < selectedPoints.length - 1 ? '1px solid #f0f0f0' : 'none',
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
                          sx={{ color: '#bbb', '&:hover': { color: '#e53935' }, cursor: 'pointer' }}
                        >
                          <RemoveIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      }
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                        <Typography
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#bbb',
                            minWidth: 18,
                            textAlign: 'center',
                          }}
                        >
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
              sx={{ mb: 3, '& .MuiToggleButton-root': { borderRadius: 0, px: 2, py: 1 } }}
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
                sx={{ width: '100%' }}
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
                Back to My Itineraries
              </SecondaryButton>
            </Stack>
          </Box>
        </Box>
      </Box>
    </PageWrapper>
  );
};
