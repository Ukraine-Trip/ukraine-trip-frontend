import { useEffect, useRef } from 'react';
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
  const prevCenter = useRef<string | null>(null);

  useEffect(() => {
    if (center) {
      const centerStr = center.join(',');
      // Якщо центр змінився, робимо flyTo для плавного зуму на обране місце
      if (centerStr !== prevCenter.current) {
        map.flyTo(center, zoom || 12, { animate: true, duration: 1.5 });
        prevCenter.current = centerStr;
      }
    }
  }, [map, center, zoom]);

  return null;
};
