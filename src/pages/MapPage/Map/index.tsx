import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Імпортуємо нашу стилізовану обгортку
import { MapWrapper } from './style.tsx'; // Вкажіть правильний шлях до вашого файлу зі стилями

const UKRAINE_CENTER: LatLngExpression = [48.3794, 31.1656];
const DEFAULT_ZOOM = 6;

export const MapComponent = () => {
  return (
    <MapWrapper>
      <MapContainer
        center={UKRAINE_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="leaflet-map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </MapWrapper>
  );
};
