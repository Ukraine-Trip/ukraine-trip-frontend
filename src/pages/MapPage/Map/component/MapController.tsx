import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapControllerProps {
  center?: [number, number] | null;
  zoom?: number;
}

const ukraineBounds: L.LatLngBoundsLiteral = [
  [44.3863, 22.1372], // Southwest
  [52.3791, 40.2277], // Northeast
];

export const MapController: React.FC<MapControllerProps> = ({
  center,
  zoom,
}) => {
  const map = useMap();
  const prevCenter = useRef<string | null>(null);

  useEffect(() => {
    map.setMaxBounds(L.latLngBounds(ukraineBounds));
  }, [map]);

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
