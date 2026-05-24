import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, TextField, InputAdornment } from '@mui/material';
import { HeroSection as StyledHeroSection } from '../../style.tsx';
import { PrimaryButton } from '../../../../style/common.tsx';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

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
          <Box sx={{ position: 'relative', width: '100%' }}>
            <TextField
              value={prompt}
              onChange={(event) => {
                if (event.target.value.length <= 100) {
                  setPrompt(event.target.value);
                }
              }}
              placeholder="Напиши запит для ШІ, щоб створити точки маршруту"
              fullWidth
              variant="outlined"
              multiline
              minRows={8}
              slotProps={{
                htmlInput: { maxLength: 100 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: '#fff' }}>
                      <AutoAwesomeIcon />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  minHeight: '200px',
                  alignItems: 'flex-start',
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.55)',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.8)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#fff',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                },
              }}
            />
            <Typography
              sx={{
                position: 'absolute',
                bottom: 10,
                right: 14,
                fontSize: '0.75rem',
                color: prompt.length >= 100 ? '#ff6b6b' : 'rgba(255,255,255,0.5)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {prompt.length}/100
            </Typography>
          </Box>

          <PrimaryButton
            disabled
            sx={{
              width: 'auto',
              minWidth: '220px',
              px: 3,
              py: 1.5,
              opacity: 1,
              cursor: 'not-allowed',
              textTransform: 'none',
              backgroundColor: 'rgba(0,0,0,0.25)',
              color: '#fff',
              '&.Mui-disabled': {
                color: '#fff',
                opacity: 0.85,
                backgroundColor: 'rgba(0,0,0,0.25)',
              },
            }}
          >
            View my trip
          </PrimaryButton>
        </Box>
      </StyledHeroSection>
    </>
  );
};
