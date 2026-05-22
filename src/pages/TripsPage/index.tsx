import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  IconButton
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { PageWrapper, PageTitle, SubTitle, SecondaryButton } from '../../style/common.tsx';
import { getAllTrips, getLikedTrips, toggleTripLike } from '../../api/trips.ts';
import { AuthContext } from '../../context/AuthContext';
import type { Trip } from '../../types/types.ts';

export const TripsPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [likedTripIds, setLikedTripIds] = useState<string[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allTrips = await getAllTrips();
        setTrips(allTrips);
        
        if (token) {
          const likedTrips = await getLikedTrips(token); 
          setLikedTripIds(likedTrips.map((t: Trip) => t.id));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

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
      console.error('Помилка при збереженні лайку:', err);
      if (isLiked) {
        setLikedTripIds((prev) => [...prev, tripId]);
      } else {
        setLikedTripIds((prev) => prev.filter((id) => id !== tripId));
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="md" sx={{ pt: 4, pb: 8 }}>
        <SubTitle>Explore Ukraine</SubTitle>
        <PageTitle>All Trips</PageTitle>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
          {trips.length === 0 && !loading ? (
            <Typography sx={{ color: 'text.secondary', ml: 2 }}>
              Наразі немає створених маршрутів.
            </Typography>
          ) : (
            trips.map((trip) => {
              const isLiked = likedTripIds.includes(trip.id);
              return (
                <Card 
                  key={trip.id}
                  sx={{ 
                    width: '100%', 
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                  }}
                >
                  <CardContent sx={{ p: 3, pb: "24px !important" }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}
                      >
                        {trip.title}
                      </Typography>
                      
                      {token && (
                        <IconButton 
                          onClick={() => handleLikeClick(trip.id)} 
                          size="small" 
                          sx={{ p: 0, ml: 2, color: isLiked ? 'error.main' : 'text.disabled' }}
                        >
                          {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                      )}
                    </Box>

                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ mb: 3 }}
                    >
                      {trip.description || 'Опис відсутній'}
                    </Typography>
                    
                    <SecondaryButton 
                      variant="outlined" 
                      size="medium" 
                      fullWidth
                      onClick={() => {
                        // 1. Шукаємо першу точку в маршруті, яка має координати
                        const firstNodeWithCoords = trip.trip_nodes?.find(
                          (n) => n.location && n.location.lat != null && n.location.lon != null
                        );
                        
                        // 2. Якщо точку знайшли — створюємо рядок параметрів для зуму
                        let zoomParams = '';
                        if (firstNodeWithCoords?.location) {
                          const { lat, lon } = firstNodeWithCoords.location;
                          // zoom=13 — це ідеальний масштаб, щоб побачити місто
                          zoomParams = `?lat=${lat}&lng=${lon}&zoom=13`; 
                        }

                        // 3. Переходимо на мапу з параметрами зуму в URL
                        navigate(`/map-page${zoomParams}`, {
                          state: {
                            tripId: trip.id,
                            tripMeta: {
                              title: trip.title,
                              description: trip.description,
                              start_date: trip.start_date,
                              end_date: trip.end_date,
                              waypoints: trip.trip_nodes?.map((n) => ({
                                name: n.location?.name || 'Невідома локація',
                                order_index: n.order_index,
                              })) || [],
                            },
                          },
                        });
                      }}
                    >
                      Show on Map
                    </SecondaryButton>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>
      </Container>
    </PageWrapper>
  );
};