import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, TextField, InputAdornment } from '@mui/material';
import { Link } from 'react-router-dom';
import { HeroSection as StyledHeroSection } from '../../style.tsx';
import { PrimaryButton } from '../../../../style/common.tsx';

export const HeroSection: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const isWaitingForAI = true;

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

        <Box
          sx={{
            mt: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            width: '100%',
            maxWidth: '560px',
          }}
        >
          <PrimaryButton
            component={Link}
            to="/create-route"
            sx={{ width: '100%' }}
          >
            Explore trip
          </PrimaryButton>

          <TextField
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Напиши запит для ШІ, щоб створити точки маршруту"
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: '#fff' }}>
                  🌟
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.35)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.7)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#fff',
                },
              },
              '& .MuiInputBase-input': {
                color: '#fff',
              },
              width: '100%',
            }}
          />

          <PrimaryButton
            disabled
            sx={{
              width: '100%',
              opacity: 0.65,
              cursor: 'not-allowed',
              textTransform: 'none',
            }}
          >
            Waiting for AI response...
          </PrimaryButton>
        </Box>
      </StyledHeroSection>
    </>
  );
};
