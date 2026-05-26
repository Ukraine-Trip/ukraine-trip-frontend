import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  IconButton,
  Chip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { PageWrapper, PageTitle, SubTitle, SecondaryButton } from '../../style/common.tsx';
import { getMyTrips, getLikedTrips, toggleTripLike } from '../../api/trips.ts';
import { AuthContext } from '../../context/AuthContext';
import type { Trip } from '../../types/types.ts';


const formatTripDate = (start: string | null, end: string | null): string => {
  if (!start) return '';
  const fmt = (d: Date) =>
    d.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const s = new Date(start);
  if (!end || start === end) return fmt(s);
  return `${fmt(s)} — ${fmt(new Date(end))}`;
};

export const MyTripsPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [createdTrips, setCreatedTrips] = useState<Trip[]>([]);
  const [likedTrips, setLikedTrips] = useState<Trip[]>([]);
  const [likedTripIds, setLikedTripIds] = useState<string[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'created' | 'liked'>('created');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [myRes, likedRes] = await Promise.all([
          getMyTrips(token),
          getLikedTrips(token)
        ]);
        
        setCreatedTrips(myRes);
        setLikedTrips(likedRes);
        setLikedTripIds(likedRes.map((t: Trip) => t.id));
      } catch (error) {
        console.error('Failed to fetch my trips data:', error);
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
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
        }}
      >
        <CardContent sx={{ p: 3, pb: "24px !important" }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
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
                  onClick={() =>
handleLikeClick(trip.id)} 
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
              You haven't saved any trips yet. Find inspiration in the All Trips section!
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

  return (
    <PageWrapper>
      <Container maxWidth="md" sx={{ pt: 4, pb: 8 }}>
        <SubTitle>My Account</SubTitle>
        <PageTitle>My Trips</PageTitle>

        <Box sx={{ 
          display: 'flex', 
          background: '#f0f0f0', 
          borderRadius: '12px', 
          p: 0.5, 
          mb: 4, 
          width: 'fit-content' 
        }}>
          <button
            onClick={() => setActiveTab('created')}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'created' ? '#fff' : 'transparent',
              color: activeTab === 'created' ? '#1a1a2e' : '#666',
              boxShadow: activeTab === 'created' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Created
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'liked' ? '#fff' : 'transparent',
              color: activeTab === 'liked' ? '#1a1a2e' : '#666',
              boxShadow: activeTab === 'liked' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Saved
          </button>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {renderTabContent()}
        </Box>
      </Container>
    </PageWrapper>
  );
};