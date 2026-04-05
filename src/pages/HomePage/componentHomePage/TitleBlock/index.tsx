import React from 'react';
import { Typography } from '@mui/material';
import { TitleBlockSection } from '../../style.tsx';

export const TitleBlock: React.FC = () => {
    return (
        <TitleBlockSection>
            <Typography variant="h4" component="h2" align="center" sx={{ letterSpacing: '0.15rem', textTransform: 'uppercase', fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                START YOUR JOURNEY
            </Typography>
        </TitleBlockSection>
    );
};