import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export const MapController = ({ points }: { points: [number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    // Фокусуємося на маршруті ТІЛЬКИ якщо кількість точок змінилася
    // і ми не робимо це при кожному зумі
    if (map && points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
    // Залежність тільки від КІЛЬКОСТІ точок, а не від кожного чиху
  }, [map, points.length]);

  return null;
};
