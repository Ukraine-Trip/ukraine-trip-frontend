import React, { useState } from 'react';
import { Box } from '@mui/material';

import type { CityCardData } from './componentHomePage/ContentData/types';
import { HeroSection } from './componentHomePage/HeroSection';
import { TitleBlock } from './componentHomePage/TitleBlock';
import { CityCardsSection } from './componentHomePage/CityCardSection';
import { CarouselSection } from './componentHomePage/CarouselSection';

import cityCardsData from '../../librarian/images.json';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const HomePage: React.FC = () => {
  const [cities] = useState<CityCardData[]>(() =>
    shuffleArray(cityCardsData as CityCardData[])
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <HeroSection />
      <TitleBlock />
      <CityCardsSection cities={cities} />
      <CarouselSection />
    </Box>
  );
};