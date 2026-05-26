import { styled, keyframes } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

// Анімація: плавна поява та легкий виїзд з правого боку
const fadeSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Ця обгортка буде анімувати все, що в ній знаходиться
export const AnimatedCitiesWrapper = styled(Box)({
  animation: `${fadeSlideIn} 0.4s ease-out forwards`,
});

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
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  color: active ? '#d81b60' : '#000',
  fontWeight: active ? 700 : 500,
  '&:hover': { color: '#d81b60' },
  transition: 'color 0.2s ease',
}));

export const RegionText = styled(Typography)({
  fontSize: '14px',
  letterSpacing: '1px',
});

// Середня колонка (Міста)
export const CitiesColumn = styled(Box)(({ theme }) => ({
  flex: '1 1 30%',
  paddingRight: '16px',
  // За замовчуванням (на мобільних) лінії і відступу немає
  borderLeft: 'none',
  paddingLeft: '0px',
  // А на екранах від md і більше — додаємо лінію і відступ
  [theme.breakpoints.up('md')]: {
    borderLeft: '1px solid #e0e0e0',
    paddingLeft: '32px',
  },
}));

// Окремий пункт міста
export const CityItem = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  fontSize: '15px',
  cursor: 'pointer',
  color: active ? '#d81b60' : '#444',
  fontWeight: active ? 600 : 400,
  '&:hover': { color: '#d81b60' },
  transition: 'color 0.2s ease',
}));
