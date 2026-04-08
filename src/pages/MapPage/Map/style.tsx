// Файл: style.tsx
import { styled } from '@mui/material/styles';

interface MapWrapperProps {
    customHeight?: string;
}

// ВАЖЛИВО: Перевірте, чи є тут слово "export"
export const MapWrapper = styled('div')<MapWrapperProps>(({ customHeight }) => ({
    width: '100%',
    height: customHeight || 'calc(100vh - 150px)',
    minHeight: '500px',

    '& .leaflet-map-container': {
        width: '100%',
        height: '100%',
    },
}));