import React from 'react';
import {
  Box,
  Container,
  Button,
  Card,
  CardMedia,
  CardActionArea,
} from '@mui/material';
import type { CityCardData } from '../ContentData/types';
import { CardsSection, CityCard, CityNameOverlay } from '../../style.tsx';

interface CityCardsSectionProps {
  cities: CityCardData[];
}

export const CityCardsSection: React.FC<CityCardsSectionProps> = ({
  cities,
}) => {
  return (
    <CardsSection>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
            },
            mb: 3,
          }}
        >
          {cities.map((city) => (
            <CityCard as={Card} key={city.id}>
              <CardActionArea href={city.linkUrl}>
                <CardMedia
                  component="img"
                  height="214"
                  image={city.imageUrl}
                  alt={city.cityName}
                />
                <CityNameOverlay variant="h3" component="div">
                  {city.cityName}
                </CityNameOverlay>
              </CardActionArea>
            </CityCard>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              px: 6,
              py: 1.5,
              '&:hover': { backgroundColor: '#333' },
            }}
          >
            VIEW MORE
          </Button>
        </Box>
      </Container>
    </CardsSection>
  );
};
