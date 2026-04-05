import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { HeroSection as StyledHeroSection } from '../../style.tsx';

export const HeroSection: React.FC = () => {
    return (
        <>
            <AppBar position="absolute" elevation={0} sx={{ background: 'transparent' }}>
                <Toolbar />
            </AppBar>

            <StyledHeroSection>
                <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 1, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
                    Discover Ukraine with us
                </Typography>
                <Typography variant="h5" component="p" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' } }}>
                    Country research site
                </Typography>
            </StyledHeroSection>
        </>
    );
};