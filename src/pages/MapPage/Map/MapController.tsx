import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapControllerProps {
  points: [number, number][];
}

export const MapController: React.FC<MapControllerProps> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);

      map.fitBounds(bounds, {
        // На телефоні робимо великий відступ знизу (120px),
        // щоб маршрут був вище за наше Bottom Menu
        paddingTopLeft: [20, 20],
        paddingBottomRight: [20, 120],
        animate: true,
        duration: 1.2,
      });
    }
  }, [points, map]);

  return null;
};
