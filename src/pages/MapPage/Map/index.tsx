import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';

import { MapWrapper } from './style.tsx';
import { createCustomIcon } from './icons.tsx';
import { ZoomHandler } from './ZoomHandler';
import { MarkerPopup } from './MarkerPopup';
import { useVisibleMarkers } from './useVisibleMarkers';
import Routing from './Routing';
import type { ItineraryPoint } from '../../../types/types.ts';

export const MapComponent: React.FC<{ itinerary?: ItineraryPoint[] }> = ({
  itinerary = [],
}) => {
  const [zoom, setZoom] = useState(6);

  const testData: ItineraryPoint[] = [
    {
      id: '1',
      name: 'Київ',
      category: 'city',
      priority: 1,
      lat: 50.45,
      lng: 30.52,
      description: 'Столиця України',
      imageUrl:
        'https://visitukraine.today/media/blog/previews/reS9V1YfF5N2uTf3P0K6X6kL7P8S0C1v.jpg',
    },
    {
      id: '2',
      name: 'Львів',
      category: 'city',
      priority: 1,
      lat: 49.83,
      lng: 24.02,
      description: 'Культурна столиця',
      imageUrl: 'https://tvoemisto.tv/media/gallery/full/l/v/lviv_night.jpg',
    },

    {
      id: '3',
      name: 'Підгорецький замок',
      category: 'landmark',
      priority: 2,
      lat: 49.94,
      lng: 24.98,
      description:
        'Один із найкращих у Європі зразків поєднання ренесансного палацу з бастіонними укріпленнями.',
      imageUrl: 'https://ipress.ua/media/gallery/full/p/i/pidgirci.jpg',
    },
    {
      id: '4',
      name: 'Житомир',
      category: 'city',
      priority: 2,
      lat: 50.25,
      lng: 28.65,
      description: 'Місто космічної слави та скелястих парків.',
    },

    {
      id: '5',
      name: 'Олеський замок',
      category: 'culture',
      priority: 3,
      lat: 49.96,
      lng: 24.9,
      description: 'Найстаріший замок Галичини, що зберігся.',
      imageUrl: 'https://MD-Ukraine.com/images/m/2000x1200/556_1.jpg',
    },
    {
      id: '6',
      name: 'Рівне (Бурштиновий музей)',
      category: 'culture',
      priority: 3,
      lat: 50.61,
      lng: 26.25,
      description: 'Унікальні експонати з поліського бурштину.',
    },

    {
      id: '7',
      name: 'Стрийський парк',
      category: 'park',
      priority: 4,
      lat: 49.82,
      lng: 24.03,
      description: 'Один із найстаріших і найгарніших парків Львова.',
    },
    {
      id: '8',
      name: 'Кафе "Львівська копальня кави"',
      category: 'cafe',
      priority: 4,
      lat: 49.841,
      lng: 24.032,
      description: 'Місце, де каву добувають прямо з-під землі.',
    },

    {
      id: '9',
      name: 'АЗС OKKO',
      category: 'stop',
      priority: 5,
      lat: 50.15,
      lng: 25.75,
      description: 'Зупинка на перепочинок та каву.',
    },
    {
      id: '10',
      name: 'Автостанція Дубно',
      category: 'stop',
      priority: 5,
      lat: 50.41,
      lng: 25.74,
      description: 'Транспортний вузол поруч із замком.',
    },
  ];

  const activeData = itinerary.length > 0 ? itinerary : testData;

  const polylinePositions = useMemo(() => {
    return activeData.map((p) => [p.lat, p.lng] as [number, number]);
  }, [activeData]);

  const visibleMarkers = useVisibleMarkers(activeData, zoom);

  return (
    <MapWrapper>
      <MapContainer
        center={[48.3794, 31.1656]}
        zoom={6}
        scrollWheelZoom={true}
        className="leaflet-map-container"
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <ZoomHandler setZoom={setZoom} />

        {polylinePositions.length >= 2 && (
          <Routing points={polylinePositions} />
        )}

        <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
          {visibleMarkers.map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={createCustomIcon(point.category)}
            >
              <MarkerPopup point={point} />
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </MapWrapper>
  );
};
