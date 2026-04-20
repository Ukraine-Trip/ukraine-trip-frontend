import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// 1. Стилі для роутингу (лінії по дорогах)
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import { MapWrapper } from './style.tsx';
import { MapController } from './MapController';
import { cityIcon, landmarkIcon } from './icons.ts';
import Routing from './Routing';

// Імпорт твого довідника
import regionsData from '../../../librarian/cities.json';

export interface ItineraryPoint {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  lat: number;
  lng: number;
}

interface MapComponentProps {
  itinerary?: ItineraryPoint[];
}

export const MapComponent: React.FC<MapComponentProps> = ({
  itinerary = [],
}) => {
  // 2. ТЕСТОВІ ДАНІ: Якщо itinerary порожній, малюємо шлях Львів -> Київ
  // Коли підключимо бек, просто видали цю змінну і використовуй itinerary
  const testData: ItineraryPoint[] = [
    {
      id: 'test-1',
      name: 'Львів',
      category: 'city',
      description: 'Культурна столиця',
      imageUrl:
        'https://i.pinimg.com/1200x/ad/67/ba/ad67ba9cf0586f3e526aeb88c52b9b9d.jpg',
      lat: 49.83,
      lng: 24.02,
    },
    {
      id: 'test-2',
      name: 'Київ',
      category: 'city',
      description: 'Столиця України',
      imageUrl:
        'https://i.pinimg.com/736x/83/f7/42/83f742c6a773422e37e003b09d163e26.jpg',
      lat: 50.45,
      lng: 30.52,
    },
  ];

  // Вибираємо, що відображати: реальні дані або тест
  const activeData = itinerary.length > 0 ? itinerary : testData;

  // Координати для компонента Routing
  const polylinePositions = activeData.map(
    (p) => [p.lat, p.lng] as [number, number]
  );


  const getRegionForCity = (cityName: string) => {
    const foundRegion = regionsData.find(
      (region) =>
        region.center === cityName ||
        region.cities.some((city) => city.name === cityName)
    );
    return foundRegion ? foundRegion.name : null;
  };

  return (
    <MapWrapper>
      <MapContainer
        center={[48.3794, 31.1656]}
        zoom={6}
        scrollWheelZoom={true}
        zoomControl={false}
        className="leaflet-map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 3. КОМПОНЕНТ РОУТИНГУ: малює шлях ПО ДОРОГАХ */}
        {polylinePositions.length >= 2 && (
          <Routing points={polylinePositions} />
        )}

        {/* Відображення маркерів */}
        {activeData.map((point) => {
          const regionName = getRegionForCity(point.name);

          return (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={point.category === 'landmark' ? landmarkIcon : cityIcon}
            >
              <Popup minWidth={200}>
                <div style={{ textAlign: 'center' }}>
                  {regionName && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#888',
                        textTransform: 'uppercase',
                      }}
                    >
                      {regionName}
                    </span>
                  )}

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
          );
        })}

        <MapController points={polylinePositions} />
      </MapContainer>
    </MapWrapper>
  );
};
