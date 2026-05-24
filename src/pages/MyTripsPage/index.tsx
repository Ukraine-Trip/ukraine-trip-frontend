import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import {
  PageWrapper,
  PageTitle,
  SubTitle,
  SecondaryButton,
} from '../../style/common.tsx';
import { getMyTrips, getLikedTrips, toggleTripLike } from '../../api/trips.ts';
import { AuthContext } from '../../context/AuthContext';
import type { Trip } from '../../types/types.ts';

// Додали твою функцію форматування дат (трохи адаптували під англійську для консистентності)
const formatTripDate = (start: string | null, end: string | null): string => {
  if (!start) return '';
  const fmt = (d: Date) =>
    d.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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

    fetchData();
  }, [token, navigate]);

  const handleLikeClick = async (tripId: string) => {
    if (!token) return;

    const isLiked = likedTripIds.includes(tripId);

    if (isLiked) {
      setLikedTripIds((prev) => prev.filter((id) => id !== tripId));
    } else {
      setLikedTripIds((prev) => [...prev, tripId]);
    }

    try {
      await toggleTripLike(tripId, token);
    } catch (err) {
      console.error('Like error:', err);
      if (isLiked) {
        setLikedTripIds((prev) => [...prev, tripId]);
      } else {
        setLikedTripIds((prev) => prev.filter((id) => id !== tripId));
      }
    }
  };

  const renderTripCard = (trip: Trip, hideHeart: boolean) => {
    const isLiked = likedTripIds.includes(trip.id);
    const nodesCount = trip.trip_nodes?.length || 0;

    return (
      <Card
        key={trip.id}
        sx={{
          width: '100%',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.2s',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
        }}
      >
        <CardContent sx={{ p: 3, pb: '24px !important' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}
              >
                {trip.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {formatTripDate(trip.start_date, trip.end_date)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={`${nodesCount} ${nodesCount === 1 ? 'point' : 'points'}`}
                size="small"
                sx={{ mr: hideHeart ? 0 : 2 }}
              />
              {!hideHeart && (
                <IconButton
                  onClick={() => handleLikeClick(trip.id)}
                  size="small"
                  sx={{ p: 0, color: isLiked ? 'error.main' : 'text.disabled' }}
                >
                  {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              )}
            </Box>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {trip.description || 'No description available'}
          </Typography>

          <SecondaryButton
            variant="outlined"
            size="medium"
            fullWidth
            onClick={() => navigate(`/trip/${trip.id}`)} // 👈 ТУТ МИ ЗМІНИЛИ НАВІГАЦІЮ
          >
            View Details
          </SecondaryButton>
        </CardContent>
      </Card>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'created':
        return createdTrips.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography sx={{ color: 'text.secondary', mb: 2 }}>
              You haven't created any trips yet.
            </Typography>
            <SecondaryButton onClick={() => navigate('/itinerary')}>
              Create your first trip
            </SecondaryButton>
          </Box>
        ) : (
          createdTrips.map((trip) => renderTripCard(trip, true))
        );

      case 'liked':
        return likedTrips.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography sx={{ color: 'text.secondary', mb: 2 }}>
              You haven't saved any trips yet. Find inspiration in the All Trips
              section!
            </Typography>
            <SecondaryButton onClick={() => navigate('/trips')}>
              Browse all trips
            </SecondaryButton>
          </Box>
        ) : (
          likedTrips.map((trip) => renderTripCard(trip, false))
        );

      default:
        return null;
    }
  };

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

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: '0.95rem', color: '#666', maxWidth: 680 }}
            >
              Тут відображаються маршрути, які ви створили. Ви можете
              переглянути їх або побудувати новий маршрут.
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
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  py: 2,
                  borderBottom: '1px solid #eee',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 2,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primary={trip.title}
                    secondary={formatTripDate(trip.start_date, trip.end_date)}
                    secondaryTypographyProps={{
                      sx: { color: 'text.secondary' },
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <Chip
                      label={`${trip.trip_nodes.length} ${trip.trip_nodes.length === 1 ? 'point' : 'points'}`}
                      size="small"
                    />
                    <SecondaryButton
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: '0.65rem', py: '6px', px: '14px' }}
                      onClick={() => navigate(`/trip/${trip.id}`)}
                    >
                      View on Map
                    </SecondaryButton>
                  </Box>
                </Box>
                {trip.description && (
                  <Typography
                    sx={{ mt: 1, color: 'text.secondary', fontSize: '0.9rem' }}
                  >
                    {trip.description}
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </PageWrapper>
  );
};
