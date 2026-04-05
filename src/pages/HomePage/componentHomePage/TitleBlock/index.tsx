import React from 'react';
import { Typography, Box } from '@mui/material';

export const TitleBlock: React.FC = () => {
    return (
        <Box className="title-block-section">
            <Typography variant="h4" component="h2" align="center" sx={{ letterSpacing: '0.15rem', textTransform: 'uppercase', fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                START YOUR JOURNEY
            </Typography>
        </Box>
    );
};