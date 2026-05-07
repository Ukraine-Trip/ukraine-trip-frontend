import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { PageTitle } from '../../../../style/common.tsx';
import {
  CarouselSection as StyledCarouselSection,
  CarouselWrapper,
  CarouselHeader,
  CarouselSubtitle,
  CarouselContainer,
  CarouselCard,
  LocationBadge,
  BadgeText,
  DescriptionText,
  ExploreButton,
} from '../../style.tsx';
import { getAllTrips } from '../../../../api/trips.ts';
import type { Trip } from '../../../../types/types.ts';

const CARD_GRADIENTS = [
  'linear-gradient(145deg, #1a3c2e 0%, #2e7d5a 60%, #1b5e40 100%)',
  'linear-gradient(145deg, #1a2c3c 0%, #2e5f7d 60%, #1b3d5e 100%)',
  'linear-gradient(145deg, #3c2a1a 0%, #7d5a2e 60%, #5e3d1b 100%)',
  'linear-gradient(145deg, #2c1a3c 0%, #5f2e7d 60%, #3d1b5e 100%)',
  'linear-gradient(145deg, #1a3a3c 0%, #2e7a7d 60%, #1b595e 100%)',
];

const MapPinIcon: React.FC<{ color?: string }> = ({ color = 'rgba(255,255,255,0.15)' }) => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const formatDateRange = (start: string | null, end: string | null): string => {
  if (!start) return '';
  const s = new Date(start);
  const e = end ? new Date(end) : null;

  const day = (d: Date) => d.getDate();
  const month = (d: Date) =>
    d.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
  const year = (d: Date) => d.getFullYear();

  if (!e || start === end) return `${day(s)} ${month(s)} ${year(s)}`;

  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${day(s)}–${day(e)} ${month(s)} ${year(s)}`;
  }

  return `${day(s)} ${month(s)} – ${day(e)} ${month(e)} ${year(e)}`;
};

const truncate = (text: string | null, max: number): string => {
  if (!text) return '';
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
};

export const CarouselSection: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAllTrips()
      .then(setTrips)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <StyledCarouselSection>
      <CarouselWrapper maxWidth="lg">
        <CarouselHeader>
          <PageTitle>Explore our trips</PageTitle>
          <CarouselSubtitle variant="h6">
            Incredible, breathtaking sensations
          </CarouselSubtitle>
        </CarouselHeader>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#7ab89a' }} />
          </Box>
        )}

        {error && !loading && (
          <Typography sx={{ color: '#b0c4b8', py: 4 }}>
            Failed to load trips. Please try again later.
          </Typography>
        )}

        {!loading && !error && (
          <CarouselContainer>
            {trips.map((trip, index) => {
              const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
              const dateLabel = formatDateRange(trip.start_date, trip.end_date);

              return (
                <CarouselCard key={trip.id} elevation={0}>
                  <Box className="image-wrapper">
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        background: gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MapPinIcon />
                    </Box>
                    <Box className="gradient-overlay" />
                  </Box>

                  {dateLabel && (
                    <LocationBadge>
                      <BadgeText variant="caption">{dateLabel}</BadgeText>
                    </LocationBadge>
                  )}

                  <Box className="card-content">
                    <DescriptionText variant="h5">
                      {truncate(trip.title, 60)}
                    </DescriptionText>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.75)',
                        mb: 2,
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {trip.description}
                    </Typography>
                    <ExploreButton
                      variant="outlined"
                      onClick={() => navigate('/map-page', { state: { trip } })}
                    >
                      EXPLORE TRIP
                    </ExploreButton>
                  </Box>
                </CarouselCard>
              );
            })}
          </CarouselContainer>
        )}
      </CarouselWrapper>
    </StyledCarouselSection>
  );
};