import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, List, ListItem, ListItemText, Chip } from '@mui/material';
import {
  PageWrapper,
  PageTitle,
  SubTitle,
  SecondaryButton,
  PrimaryButton,
} from '../../style/common.tsx';
import { getMyTrips } from '../../api/trips.ts';
import { AuthContext } from '../../context/AuthContext';
import type { Trip } from '../../types/types.ts';

const formatTripDate = (start: string | null, end: string | null): string => {
  if (!start) return '';
  const fmt = (d: Date) =>
    d.toLocaleString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
  const s = new Date(start);
  if (!end || start === end) return fmt(s);
  return `${fmt(s)} — ${fmt(new Date(end))}`;
};

export const MyTripsPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchMyTrips = async () => {
      setError(null);
      setLoading(true);
      try {
        const trips = await getMyTrips(token);
        setMyTrips(trips);
      } catch (error: any) {
        console.error('Помилка завантаження маршрутів:', error);
        setError('Не вдалося завантажити ваші маршрути');
      } finally {
        setLoading(false);
      }
    };

    fetchMyTrips();
  }, [token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return (
      <PageWrapper>
        <Typography sx={{ pt: 20, textAlign: 'center' }}>
          Будь ласка, увійдіть в систему
        </Typography>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Box sx={{ maxWidth: '900px', margin: '0 auto', px: 3 }}>
        <SubTitle>My Account</SubTitle>
        <PageTitle>My Itineraries</PageTitle>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.95rem', color: '#666', maxWidth: 680 }}>
              Тут відображаються маршрути, які ви створили. Ви можете переглянути їх або побудувати новий маршрут.
            </Typography>
          </Box>
          <SecondaryButton
            variant="outlined"
            onClick={() => navigate('/itinerary')}
            sx={{ alignSelf: 'center' }}
          >
            Create New Itinerary
          </SecondaryButton>
        </Box>

        {error ? (
          <Typography sx={{ color: 'error.main' }}>{error}</Typography>
        ) : myTrips.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary', mb: 2 }}>
              Ви ще не створили жодного маршруту.
            </Typography>
            <PrimaryButton onClick={() => navigate('/itinerary')}>
              Build Your First Itinerary
            </PrimaryButton>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {myTrips.map((trip) => (
              <ListItem
                key={trip.id}
                sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2, borderBottom: '1px solid #eee' }}
              >
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <ListItemText
                    primary={trip.title}
                    secondary={formatTripDate(trip.start_date, trip.end_date)}
                    secondaryTypographyProps={{ sx: { color: 'text.secondary' } }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip
                      label={`${trip.trip_nodes.length} ${trip.trip_nodes.length === 1 ? 'point' : 'points'}`}
                      size="small"
                    />
                    <SecondaryButton
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: '0.65rem', py: '6px', px: '14px' }}
                      onClick={() =>
                        navigate(`/trip/${trip.id}`)
                      }
                    >
                      View on Map
                    </SecondaryButton>
                  </Box>
                </Box>
                {trip.description && (
                  <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: '0.9rem' }}>
                    {trip.description}
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        )}

        <Box sx={{ mt: 4 }}>
          <SecondaryButton
            variant="outlined"
            onClick={() => navigate('/account')}
          >
            Back to Account
          </SecondaryButton>
        </Box>
      </Box>
    </PageWrapper>
  );
};
