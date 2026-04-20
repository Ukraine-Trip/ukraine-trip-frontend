import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import ParkIcon from '@mui/icons-material/Park';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

// Функція для створення іконки
export const createCustomIcon = (category: string) => {
  const getIcon = () => {
    switch (category) {
      case 'city':
        return LocationCityIcon;
      case 'cafe':
        return LocalCafeIcon;
      case 'park':
        return ParkIcon;
      case 'culture':
        return AccountBalanceIcon;
      case 'landmark':
        return CameraAltIcon;
      case 'stop':
        return DirectionsBusIcon;
      default:
        return CameraAltIcon;
    }
  };

  const IconComponent = getIcon();

  // Саме через цей рядок файл має бути .tsx
  const iconHTML = renderToString(
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '50%',
        padding: '5px',
        border: '2px solid #302d2c',
        display: 'flex',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <IconComponent style={{ color: '#302d2c', fontSize: '20px' }} />
    </div>
  );

  return L.divIcon({
    html: iconHTML,
    className: 'custom-mui-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Центруємо іконку по горизонталі, низ — по вертикалі
  });
};
