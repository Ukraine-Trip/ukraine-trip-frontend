import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

// Головний контейнер для каскадного меню
export const MenuContainer = styled(Box)({
  display: 'flex',
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '0 16px',
});

// Ліва колонка (Регіони)
export const RegionsColumn = styled(Box)({
  flex: '1 1 30%',
  paddingRight: '16px',
});

// Окремий пункт регіону (з обробкою активного стану)
export const RegionItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active', // Щоб React не сварився на кастомний проп
})<{ active?: boolean }>(({ active }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  color: active ? '#d81b60' : '#000',
  fontWeight: active ? 700 : 500,
  '&:hover': { color: '#d81b60' },
}));

export const RegionText = styled(Typography)({
  fontSize: '14px',
  letterSpacing: '1px',
});

// Середня колонка (Міста)
export const CitiesColumn = styled(Box)({
  flex: '1 1 30%',
  paddingLeft: '32px',
  paddingRight: '16px',
  borderLeft: '1px solid #e0e0e0',
});

// Окремий пункт міста
export const CityItem = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  fontSize: '15px',
  cursor: 'pointer',
  color: active ? '#d81b60' : '#444',
  fontWeight: active ? 600 : 400,
  '&:hover': { color: '#d81b60' },
}));

// Права колонка (Картинка)
export const ImageColumn = styled(Box)({
  flex: '1 1 40%',
  paddingLeft: '16px',
});

export const DestinationImage = styled('img')({
  width: '100%',
  height: '400px',
  objectFit: 'cover',
  display: 'block',
});
