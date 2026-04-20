import { styled } from '@mui/material/styles';

// Додаємо інтерфейс для пропсів, якщо раптом захочемо міняти висоту вручну
interface MapWrapperProps {
  customHeight?: string;
}

export const MapWrapper = styled('div')<MapWrapperProps>(
  ({ customHeight }) => ({
    width: '100%',

    // Пріоритет:
    // 1. Власна висота (якщо передана)
    // 2. 100svh (висота мобільного екрана без врахування панелей браузера) мінус висота Хедера
    height: customHeight || 'calc(100svh - 80px)',

    // Встановлюємо відносне позиціонування та z-index,
    // щоб карта правильно взаємодіяла з іншими елементами
    position: 'relative',
    zIndex: 1,

    // Стилі для внутрішнього контейнера Leaflet,
    // які використовує твій колега в MapComponent
    '& .leaflet-map-container': {
      width: '100%',
      height: '100%',
    },
  })
);
