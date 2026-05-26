import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { HeroSection as StyledHeroSection } from '../../style.tsx';
import { searchOsmPOIs } from '../../../../services/overpassService.ts';
import { parseTripQuery } from '../../../../utils/tripQueryParser.ts';
import { createTripAI } from '../../../../api/trips.ts';
import { AuthContext } from '../../../../context/AuthContext.tsx';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
 const { token } = useContext(AuthContext);
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState('Натисни Enter або → щоб знайти місця через OpenStreetMap');

  const canSubmit = prompt.trim().length >= 3 && !isBuilding;

  const handleBuild = async () => {
    if (!canSubmit) return;

    setIsBuilding(true);
    setError(null);
    setHint('🌍 Шукаю місця через OpenStreetMap…');
const cleanToken =
      token && token !== 'null' && token !== 'undefined'
        ? token.replace(/["']/g, '')
        : null;

    if (!cleanToken) {
      navigate('/login');
      return;
    }
try{


const trip = await createTripAI(
        {
prompt: prompt.trim()
        },
        cleanToken
      );
      navigate(`/trip/${trip.id}`);
      // 1. Парсимо текст → регіони, тип, назва
      
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Помилка пошуку локацій. Спробуйте ще раз.';
      setError(message);
    } finally {
      setIsBuilding(false);
      setHint('Натисни Enter або → щоб знайти місця через OpenStreetMap');
    }
  };

  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (e.key === 'Enter' && !e.shiftKey) {
  //     e.preventDefault();
  //     handleBuild();
  //   }
  // };

  return (
    <>
      <AppBar position="absolute" elevation={0} sx={{ background: 'transparent' }}>
        <Toolbar />
      </AppBar>

      <StyledHeroSection>
        <Typography
          variant="h2"
          component="h1"
          sx={{ fontWeight: 'bold', mb: 1, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
        >
          Discover Ukraine with us
        </Typography>

        <Typography
          variant="h5"
          component="p"
          sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' } }}
        >
          Country research site
        </Typography>

        {/* ── AI / OSM Input ── */}
        <Box sx={{ mt: 5, width: '100%', maxWidth: '620px', px: { xs: 2, sm: 0 } }}>
          <TextField
            value={prompt}
            onChange={(e) => {
              if (e.target.value.length <= 150) setPrompt(e.target.value);
            }}
            // onKeyDown={handleKeyDown}
            placeholder="Напр.: замки Харківщини, музеї Львова…"
            fullWidth
            variant="outlined"
            disabled={isBuilding}
            slotProps={{
              htmlInput: { maxLength: 150 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <AutoAwesomeIcon
                      sx={{
                        color: isBuilding ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.75)',
                        fontSize: '1.25rem',
                        transition: 'color 0.2s',
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleBuild}
                      disabled={!canSubmit}
                      aria-label="Знайти маршрут"
                      sx={{
                        width: 38,
                        height: 38,
                        backgroundColor: canSubmit
                          ? 'rgba(255,255,255,0.18)'
                          : 'rgba(255,255,255,0.06)',
                        color: canSubmit ? '#fff' : 'rgba(255,255,255,0.3)',
                        borderRadius: '10px',
                        transition: 'background-color 0.2s, transform 0.15s',
                        '&:hover': {
                          backgroundColor: canSubmit
                            ? 'rgba(255,255,255,0.30)'
                            : 'rgba(255,255,255,0.06)',
                          transform: canSubmit ? 'translateX(2px)' : 'none',
                        },
                        '&.Mui-disabled': { color: 'rgba(255,255,255,0.25)' },
                      }}
                    >
                      {isBuilding ? (
                        <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.6)' }} />
                      ) : (
                        <ArrowForwardRoundedIcon sx={{ fontSize: '1.1rem' }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              borderRadius: '14px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                backgroundColor: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(12px)',
                color: '#fff',
                paddingRight: '10px',
                transition: 'background-color 0.2s',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.40)', borderWidth: '1.5px' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.70)' },
                '&.Mui-focused fieldset': { borderColor: '#fff', borderWidth: '1.5px' },
                '&.Mui-disabled': { backgroundColor: 'rgba(255,255,255,0.06)' },
              },
              '& .MuiInputBase-input': {
                color: '#fff',
                py: '14px',
                fontSize: '0.97rem',
                '&::placeholder': { color: 'rgba(255,255,255,0.50)', opacity: 1 },
              },
            }}
          />

          {/* Динамічна підказка */}
          <Typography
            sx={{
              mt: 1.5,
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              letterSpacing: '0.01em',
              minHeight: '1.2em',
              transition: 'opacity 0.3s',
            }}
          >
            {hint}
          </Typography>
        </Box>
      </StyledHeroSection>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" variant="filled" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};
