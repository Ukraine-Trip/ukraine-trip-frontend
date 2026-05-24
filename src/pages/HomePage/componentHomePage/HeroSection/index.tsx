import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../../../../context/AuthContext.tsx';
import { getLocations } from '../../../../api/locations.ts';
import { createTrip } from '../../../../api/trips.ts';
import { parseTripQuery } from '../../../../utils/tripQueryParser.ts';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = prompt.trim().length >= 3 && !isBuilding;

  const handleBuild = async () => {
    if (!canSubmit) return;

    if (!token) {
      navigate('/register');
      return;
    }

    setIsBuilding(true);
    setError(null);

    try {
      // 1. Парсимо текст → регіон, тип, назва
      const { region, type, min_rating, title } = parseTripQuery(prompt);

      // 2. Отримуємо локації з API (з фільтрами якщо є)
      const locations = await getLocations({
        ...(region ? { region } : {}),
        ...(type ? { type } : {}),
        ...(min_rating ? { min_rating } : {}),
      });

      if (!locations || locations.length === 0) {
        setError('За вашим запитом не знайдено жодних локацій. Спробуйте уточнити запит.');
        return;
      }

      if (locations.length < 2) {
        setError('Знайдено менше 2 локацій — недостатньо для маршруту. Спробуйте ширший запит.');
        return;
      }

      // 3. Беремо топ-8 локацій за рейтингом
      const topLocations = [...locations]
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 8);

      // 4. Будуємо маршрут через OSRM з оптимізацією
      const trip = await createTrip(
        {
          title,
          location_ids: topLocations.map((l) => l.id),
          optimize: true,
        },
        token,
      );

      // 5. Переходимо на сторінку маршруту
      navigate(`/trip/${trip.id}`);
    } catch (err: unknown) {
      // 401 — токен протухлий або відсутній → реєстрація
      const status =
        err != null &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { status?: number } }).response?.status;
      if (status === 401) {
        navigate('/register');
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Помилка створення маршруту. Спробуйте ще раз.';
      setError(message);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBuild();
    }
  };

  return (
    <>
      <AppBar position="absolute" elevation={0} sx={{ background: 'transparent' }}>
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
          sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' } }}
        >
          Country research site
        </Typography>

        {/* ── AI Input ── */}
        <Box
          sx={{
            mt: 5,
            width: '100%',
            maxWidth: '620px',
            px: { xs: 2, sm: 0 },
          }}
        >
          <TextField
            value={prompt}
            onChange={(e) => {
              if (e.target.value.length <= 150) setPrompt(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Куди хочеш поїхати? Напр.: замки Львівщини…"
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
                      aria-label="Створити маршрут"
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
                        '&.Mui-disabled': {
                          color: 'rgba(255,255,255,0.25)',
                        },
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
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.40)',
                  borderWidth: '1.5px',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.70)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#fff',
                  borderWidth: '1.5px',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(255,255,255,0.06)',
                },
              },
              '& .MuiInputBase-input': {
                color: '#fff',
                py: '14px',
                fontSize: '0.97rem',
                '&::placeholder': {
                  color: 'rgba(255,255,255,0.50)',
                  opacity: 1,
                },
              },
            }}
          />

          {/* Підказка */}
          <Typography
            sx={{
              mt: 1.5,
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              letterSpacing: '0.01em',
            }}
          >
            {isBuilding
              ? '🤖 Підбираю локації та будую оптимальний маршрут…'
              : 'Натисни Enter або → щоб згенерувати маршрут з ШІ-оптимізацією'}
          </Typography>
        </Box>
      </StyledHeroSection>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};
