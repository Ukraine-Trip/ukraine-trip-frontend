import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Container,
  Paper,
} from '@mui/material';
import { getTripById } from '../../api/trips';
import { PageWrapper, PageTitle, SecondaryButton, PrimaryButton } from '../../style/common';
import { TripMap } from './TripMap';
import type { Trip } from '../../types/types';

const formatTripDate = (start: string | null, end: string | null): string => {
  if (!start) return '';
  const fmt = (d: Date) =>
    d.toLocaleString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
  const s = new Date(start);
  if (!end || start === end) return fmt(s);
  return `${fmt(s)} — ${fmt(new Date(end))}`;
};

export const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID маршруту не знайдено');
      setLoading(false);
      return;
    }

    const fetchTrip = async () => {
      setError(null);
      setLoading(true);
      try {
        const tripData = await getTripById(id);
        setTrip(tripData);
      } catch (error: any) {
        console.error('Помилка завантаження маршруту:', error);
        setError('Не вдалося завантажити деталі маршруту');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !trip) {
    return (
      <PageWrapper>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'error.main' }}>
              {error || 'Маршрут не знайдено'}
            </Typography>
            <SecondaryButton variant="outlined" onClick={() => navigate('/my-trips')}>
              Назад до моїх маршрутів
            </SecondaryButton>
          </Box>
        </Container>
      </PageWrapper>
    );
  }

  const handleViewOnMap = () => {
    navigate('/map-page', {
      state: {
        tripMeta: {
          title: trip.title,
          description: trip.description,
          start_date: trip.start_date,
          end_date: trip.end_date,
          waypoints: trip.trip_nodes.map((n) => ({
            name: n.location?.name ?? '',
            order_index: n.order_index,
          })),
        },
      },
    });
  };

  return (
    <PageWrapper>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <SecondaryButton
            variant="text"
            onClick={() => navigate('/my-trips')}
            sx={{ mb: 2 }}
          >
            ← Назад до моїх маршрутів
          </SecondaryButton>
        </Box>

        <Paper elevation={0} sx={{ p: 4, backgroundColor: '#f9f9f9' }}>
          <PageTitle sx={{ mb: 1 }}>{trip.title}</PageTitle>
          {trip.description && (
            <Typography sx={{ mb: 3, color: 'text.secondary', fontSize: '1rem' }}>
              {trip.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip
              label={`${trip.trip_nodes.length} ${trip.trip_nodes.length === 1 ? 'точка' : 'точок'}`}
              color="primary"
              variant="outlined"
            />
            {trip.start_date && (
              <Chip
                label={formatTripDate(trip.start_date, trip.end_date)}
                variant="outlined"
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <PrimaryButton onClick={handleViewOnMap}>
              View on Map
            </PrimaryButton>
            <SecondaryButton variant="outlined" onClick={() => navigate(`/trip/${trip.id}/edit`)}>
              Edit Itinerary
            </SecondaryButton>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, mb: 4 }}>
          <TripMap trip={trip} loading={loading} />
        </Box>

        {trip.trip_nodes.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Маршрут ({trip.trip_nodes.length} точок)
            </Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1 }}>
              {trip.trip_nodes
                .sort((a, b) => a.order_index - b.order_index)
                .map((node, index) => (
                  <ListItem
                    key={node.id}
                    sx={{
                      py: 2,
                      px: 2,
                      borderBottom: index < trip.trip_nodes.length - 1 ? '1px solid #eee' : 'none',
                      display: 'flex',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 36,
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: '#007AFF',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      {node.order_index + 1}
                    </Box>
                    <ListItemText
                      primary={node.location?.name || 'Без назви'}
                      // secondaryTypographyProps → component="div" щоб уникнути
                      // вкладеного <p> всередині <p> (MUI default = <p>)
                      secondaryTypographyProps={{ component: 'div' }}
                      secondary={
                        <>
                          {node.location?.region && (
                            <Typography
                              variant="body2"
                              component="span"
                              display="block"
                              sx={{ color: 'text.secondary' }}
                            >
                              {node.location.region}
                            </Typography>
                          )}
                          <Typography
                            variant="caption"
                            component="span"
                            display="block"
                            sx={{ color: '#999' }}
                          >
                            Координати: {node.location?.lat.toFixed(4)}, {node.location?.lon.toFixed(4)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        )}

        <Box sx={{ mt: 4, mb: 2 }}>
          <SecondaryButton
            variant="outlined"
            onClick={() => navigate('/my-trips')}
          >
            Назад до моїх маршрутів
          </SecondaryButton>
        </Box>
      </Container>
    </PageWrapper>
  );
};
