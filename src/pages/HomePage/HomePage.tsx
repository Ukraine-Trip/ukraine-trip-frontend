// index.tsx (або HomePage.tsx)
import React, { useState } from 'react';
import { Box } from '@mui/material';
import './style.css';

import type { CityCardData, CarouselItemData } from './componentsHomePage/types';
import { HeroSection } from './componentsHomePage/HeroSection';
import { TitleBlock } from './componentsHomePage/TitleBlock';
import { CityCardsSection } from './componentsHomePage/CityCardsSection';
import { CarouselSection } from './componentsHomePage/CarouselSection';


import cityCardsData from '../../librarian/images.json';
import carouselData from '../../librarian/carousel.json';

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export const HomePage: React.FC = () => {
    // Ініціалізація стану з перемішаними даними
    const [cities] = useState<CityCardData[]>(() =>
        shuffleArray(cityCardsData as CityCardData[])
    );
    const [carousel] = useState<CarouselItemData[]>(() =>
        shuffleArray(carouselData as CarouselItemData[])
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <HeroSection />
            <TitleBlock />
            <CityCardsSection cities={cities} />
            <CarouselSection carousel={carousel} />
        </Box>
    );
};