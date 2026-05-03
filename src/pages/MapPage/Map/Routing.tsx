import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

interface RoutingProps {
  points: [number, number][];
}

const Routing: React.FC<RoutingProps> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: points.map((p) => L.latLng(p[0], p[1])),
      lineOptions: {
        styles: [{ color: '#444', weight: 4, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: false,
      // Додаємо "as any", щоб TypeScript не сварився на null
      createMarker: () => null as any,
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        try {
          map.removeControl(routingControl);
        } catch (e) {}
      }
    };
  }, [map, points]);

  return null;
};

export default Routing;
