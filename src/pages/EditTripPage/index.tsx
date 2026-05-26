import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Stack,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../api/auth';
import { getTripById, updateTrip } from '../../api/trips';
import {
  PageWrapper,
  PageTitle,
  PrimaryButton,
  SecondaryButton,
  CommonInput,
  SubTitle,
} from '../../style/common';
import type { Trip } from '../../types/types';

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

export const EditTripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<LocationItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!id) {
      setError('ID маршруту не знайдено');
      setLoading(false);
      return;
    }

    const loadTrip = async () => {
      setError(null);
      setLoading(true);
      try {
        const tripData = await getTripById(id);
        setTrip(tripData);
        setForm({
          title: tripData.title,
          description: tripData.description ?? '',
          start_date: tripData.start_date ? tripData.start_date.slice(0, 10) : '',
          end_date: tripData.end_date ? tripData.end_date.slice(0, 10) : '',
        });
      } catch (loadError: any) {
        console.error('Помилка завантаження маршруту:', loadError);
        setError('Не вдалося завантажити маршрут для редагування.');
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [id]);

  useEffect(() => {
    const fetchLocations = async () => {
      setLocationsLoading(true);
      setLocationsError(null);
      try {
        const publicReq = api.get('/locations/');
        const myReq = token && token !== 'null' && token !== 'undefined'
          ? api.get('/locations/', {
              params: { filter_type: 'my' },
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null);

        const [publicResult, myResult] = await Promise.allSettled([publicReq, myReq]);

        let publicLocations: LocationItem[] = [];
        if (publicResult.status === 'fulfilled' && publicResult.value) {
          publicLocations = publicResult.value.data.map((loc: any) => ({
            id: String(loc.id),
            name: loc.name,
            region: loc.region ?? '',
            type: loc.type ?? 'landmark',
            lat: loc.lat,
            lng: loc.lon,
            description: loc.description ?? '',
          }));
        }

        let myLocations: LocationItem[] = [];
        if (myResult.status === 'fulfilled' && myResult.value) {
          myLocations = myResult.value.data.map((loc: any) => ({
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

        const publicIds = new Set(publicLocations.map((loc) => loc.id));
        const uniqueMyLocations = myLocations.filter((loc) => !publicIds.has(loc.id));
        setLocations([...publicLocations, ...uniqueMyLocations]);
      } catch (err: any) {
        console.error('Помилка завантаження локацій:', err);
        setLocationsError('Не вдалося завантажити доступні точки.');
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();
  }, [token]);

  useEffect(() => {
    if (!trip || locationsLoading) return;

    const mapNodeToLocation = (node: Trip['trip_nodes'][number]): LocationItem => {
      const locationId = String(node.location?.id ?? node.location_id);
      const found = locations.find((loc) => loc.id === locationId);
      if (found) return found;
      const locAny = node.location as any;
      return {
        id: locationId,
        name: node.location?.name ?? 'Без назви',
        region: node.location?.region ?? '',
        type: locAny?.type ?? 'landmark',
        lat: node.location?.lat ?? 0,
        lng: node.location?.lon ?? 0,
        description: locAny?.description ?? '',
      };
    };

    setSelectedPoints(
      [...trip.trip_nodes]
        .sort((a, b) => a.order_index - b.order_index)
        .map(mapNodeToLocation)
    );
  }, [trip, locations, locationsLoading]);

  const filteredLocations = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return locations;
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.region.toLowerCase().includes(query) ||
        loc.type.toLowerCase().includes(query),
    );
  }, [locations, search]);

  const isSelected = (id: string) => selectedPoints.some((point) => point.id === id);

  const togglePoint = (loc: LocationItem) => {
    setSelectedPoints((prev) => {
      const selected = prev.some((item) => item.id === loc.id);
      if (selected) return prev.filter((item) => item.id !== loc.id);
      return [...prev, loc];
    });
  };

  const removePoint = (id: string) => {
    setSelectedPoints((prev) => prev.filter((point) => point.id !== id));
  };

  const movePoint = (index: number, direction: -1 | 1) => {
    setSelectedPoints((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Назва маршруту є обов’язковою.');
      return;
    }

    if (!token) {
      setError('Будь ласка, увійдіть, щоб зберегти зміни.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateTrip(
        id!,
        {
          title: form.title.trim(),
          description: form.description.trim() || null,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          location_ids: selectedPoints.map((point) => point.id),
        },
        token,
      );
      navigate(`/trip/${id}`);
    } catch (saveError: any) {
      console.error('Помилка збереження маршруту:', saveError);
      setError('Не вдалося зберегти зміни. Спробуйте пізніше.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (trip) {
      navigate(`/trip/${trip.id}`);
    } else {
      navigate('/my-trips');
    }
  };

  if (loading || locationsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <SecondaryButton variant="text" onClick={handleCancel} sx={{ mb: 2 }}>
            ← Назад
          </SecondaryButton>
          <PageTitle>Редагування маршруту</PageTitle>
          <Typography sx={{ color: 'text.secondary', mt: 1 }}>
            Змінюйте назву, опис, дати і список точок маршруту.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSave} sx={{ display: 'grid', gap: 4 }}>
          <Stack spacing={2}>
            <CommonInput
              fullWidth
              label="Назва маршруту"
              value={form.title}
              onChange={handleChange('title')}
              required
            />
            <CommonInput
              fullWidth
              label="Опис"
              value={form.description}
              onChange={handleChange('description')}
              multiline
              rows={4}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <CommonInput
                fullWidth
                label="Дата початку"
                type="date"
                value={form.start_date}
                onChange={handleChange('start_date')}
                InputLabelProps={{ shrink: true }}
              />
              <CommonInput
                fullWidth
                label="Дата завершення"
                type="date"
                value={form.end_date}
                onChange={handleChange('end_date')}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 4,
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              alignItems: 'start',
            }}
          >
            <Box>
              <SubTitle>Available Locations</SubTitle>
              <TextField
                fullWidth
                size="small"
                placeholder="Пошук за назвою, регіоном або типом..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                      <SearchIcon sx={{ color: '#999' }} />
                    </Box>
                  ),
                }}
              />
              {locationsError ? (
                <Typography sx={{ color: 'error.main' }}>{locationsError}</Typography>
              ) : filteredLocations.length === 0 ? (
                <Typography sx={{ color: 'text.secondary' }}>Нічого не знайдено.</Typography>
              ) : (
                <Box
                  sx={{
                    border: '1px solid #eee',
                    maxHeight: '560px',
                    overflowY: 'auto',
                  }}
                >
                  <List disablePadding>
                    {filteredLocations.map((loc, idx) => (
                      <ListItem
                        key={loc.id}
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderBottom: idx < filteredLocations.length - 1 ? '1px solid #f0f0f0' : 'none',
                          bgcolor: isSelected(loc.id) ? '#f8f8f8' : 'transparent',
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
                              width: 32,
                              height: 32,
                              color: isSelected(loc.id) ? '#fff' : '#000',
                              bgcolor: isSelected(loc.id) ? '#000' : 'transparent',
                              '&:hover': {
                                bgcolor: isSelected(loc.id) ? '#333' : '#f5f5f5',
                              },
                            }}
                          >
                            {isSelected(loc.id) ? <RemoveIcon sx={{ fontSize: 16 }} /> : <AddIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={loc.name}
                          secondary={`${loc.region} • ${loc.type}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>

            <Box>
              <SubTitle>Selected Route</SubTitle>
              {selectedPoints.length === 0 ? (
                <Box
                  sx={{
                    border: '1px dashed #ccc',
                    borderRadius: 0,
                    py: 8,
                    px: 3,
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <Typography sx={{ fontSize: '0.95rem' }}>
                    Додайте точки до маршруту, щоб змінювати порядок або видаляти їх.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    border: '1px solid #eee',
                    maxHeight: '560px',
                    overflowY: 'auto',
                  }}
                >
                  <List disablePadding>
                    {selectedPoints.map((point, index) => (
                      <ListItem
                        key={point.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 2,
                          py: 1.5,
                          borderBottom: index < selectedPoints.length - 1 ? '1px solid #f0f0f0' : 'none',
                        }}
                        secondaryAction={
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => movePoint(index, -1)}
                              disabled={index === 0}
                            >
                              <ArrowUpwardIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => movePoint(index, 1)}
                              disabled={index === selectedPoints.length - 1}
                            >
                              <ArrowDownwardIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => removePoint(point.id)}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={index + 1}
                                size="small"
                                sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                              />
                              <Typography sx={{ fontWeight: 600 }}>{point.name}</Typography>
                            </Box>
                          }
                          secondary={point.region}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Box>

          {error && (
            <Typography sx={{ color: 'error.main' }}>{error}</Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Збереження...' : 'Зберегти зміни'}
            </PrimaryButton>
            <SecondaryButton variant="outlined" onClick={handleCancel} disabled={saving}>
              Скасувати
            </SecondaryButton>
          </Box>
        </Box>
      </Container>
    </PageWrapper>
  );
};
