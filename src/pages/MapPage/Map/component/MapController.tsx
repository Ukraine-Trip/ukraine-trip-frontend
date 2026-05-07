import { useEffect, useRef } from 'react';  // ← додати useRef
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
  const hasSetView = useRef(false); // ← додати це

  useEffect(() => {
    if (center && !hasSetView.current) { // ← змінити умову
      map.setView(center, zoom || 12);
      hasSetView.current = true; // ← додати це
    }
  }, [map, center, zoom]);

  return null;
};