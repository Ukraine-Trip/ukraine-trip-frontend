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
  const prevCenterRef = useRef<string | null>(null);

  useEffect(() => {
    map.setMaxBounds(L.latLngBounds(ukraineBounds));
    map.setMinZoom(6);
  }, [map]);

  useEffect(() => {
    if (center && zoom) {
      const centerStr = center.join(',');
      if (centerStr !== prevCenterRef.current) {
        map.flyTo(center, zoom, { animate: true, duration: 1.5 });
        prevCenterRef.current = centerStr;
      }
    }
  }, [map, center, zoom]);

  return null;
};
