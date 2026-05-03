import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapControllerProps {
  center?: [number, number] | null;
  zoom?: number;
}

export const MapController: React.FC<MapControllerProps> = ({
  center,
  zoom,
}) => {
  const map = useMap();

  useEffect(() => {
    // Фокус срабатывает ТОЛЬКО если есть прямые координаты (например из поиска).
    // Никакой больше самостоятельной центровки на маршруте!
    if (center) {
      map.setView(center, zoom || 12);
    }
  }, [map, center, zoom]);

  return null;
};
