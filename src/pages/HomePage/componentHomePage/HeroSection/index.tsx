import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom'; // 1. Додаємо імпорт Link
import { HeroSection as StyledHeroSection } from '../../style.tsx';
import { PrimaryButton } from '../../../../style/common.tsx';

export const HeroSection: React.FC = () => {
  return (
    <>
      <AppBar
        position="absolute"
        elevation={0}
        sx={{ background: 'transparent' }}
      >
        <Toolbar />
      </AppBar>

      <StyledHeroSection>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          }}
        >
          Discover Ukraine with us
        </Typography>
        <Typography
          variant="h5"
          component="p"
          sx={{
            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' },
          }}
        >
          Country research site
        </Typography>

        {/* 2. Перетворюємо кнопку на посилання */}
        <PrimaryButton
          component={Link}
          to="/*" /* Вкажіть тут URL потрібної сторінки */
          sx={{ mt: 4 }}
        >
          Explore Now
        </PrimaryButton>
      </StyledHeroSection>
    </>
  );
};
