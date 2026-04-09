import React from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapWrapper } from './style.tsx';
import { MapController } from './MapController';
// Імпортуємо іконки, які ми винесли в окремий файл
import { cityIcon, landmarkIcon } from './icons.ts';

// Описуємо тип для точок, щоб TypeScript не сварився
interface ItineraryPoint {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  lat: number;
  lng: number;
}

export const MapComponent: React.FC<{ itinerary?: ItineraryPoint[] }> = ({
  itinerary = [],
}) => {
  // 1. Твій новий детальний масив для перевірки
  const testItinerary: ItineraryPoint[] = [
    {
      id: '1',
      name: 'Львів',
      category: 'city',
      description: 'Культурна столиця України з неймовірною архітектурою.',
      imageUrl:
        'https://i.pinimg.com/1200x/ad/67/ba/ad67ba9cf0586f3e526aeb88c52b9b9d.jpg',
      lat: 49.83,
      lng: 24.02,
    },
    {
      id: '2',
      name: 'Київ',
      category: 'city',
      description: 'Серце України, де історія зустрічається з сучасністю.',
      imageUrl:
        'https://i.pinimg.com/736x/83/f7/42/83f742c6a773422e37e003b09d163e26.jpg',
      lat: 50.45,
      lng: 30.52,
    },
    {
      id: '3',
      name: 'Одеський Оперний',
      category: 'landmark',
      description: 'Один з найкрасивіших театрів світу.',
      imageUrl:
        'https://i.pinimg.com/1200x/ad/67/ba/ad67ba9cf0586f3e526aeb88c52b9b9d.jpg',
      lat: 46.48,
      lng: 30.72,
    },
  ];

  // Використовуємо тест, якщо ззовні нічого не прийшло
  const activeData = itinerary.length > 0 ? itinerary : testItinerary;

  // Розраховуємо лінію на основі activeData
  const polylinePositions = activeData.map(
    (p) => [p.lat, p.lng] as [number, number]
  );

  return (
    <MapWrapper>
      <MapContainer
        center={[48.3794, 31.1656]}
        zoom={6}
        scrollWheelZoom={true}
        zoomControl={false}
        dragging={true}
        touchZoom={true}
        className="leaflet-map-container"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Малюємо лінію маршруту */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#302d2c',
              weight: 5,
              opacity: 0.8,
              dashArray: '10, 10',
            }}
          />
        )}

        {/* Рендеримо маркери з попапами */}
        {activeData.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            // Вибір іконки залежно від категорії
            icon={point.category === 'landmark' ? landmarkIcon : cityIcon}
          >
            <Popup minWidth={200}>
              <div style={{ textAlign: 'center' }}>
                <strong
                  style={{
                    fontSize: '1.1rem',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {point.name}
                </strong>
                {point.imageUrl && (
                  <img
                    src={point.imageUrl}
                    alt={point.name}
                    style={{
                      width: '100%',
                      borderRadius: '4px',
                      marginBottom: '8px',
                    }}
                  />
                )}
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                  {point.description}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapController points={polylinePositions} />
      </MapContainer>
    </MapWrapper>
  );
};
