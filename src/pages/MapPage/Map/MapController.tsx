import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapControllerProps {
  points?: [number, number][];
  center?: [number, number] | null;
  zoom?: number;
}

export const MapController = ({ points, center, zoom = 12 }: MapControllerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (center && center.length === 2) {
      // Замість setView використовуємо flyTo для плавного польоту.
      // Він спрацює лише коли зміняться координати в URL.
      map.flyTo(center, zoom, { duration: 1.5 });
    }
    else if (points && points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }

    // Залежності розбито на примітиви, щоб уникнути постійного рендеру
  }, [map, points?.length, center?.[0], center?.[1], zoom]);

  return null;
};