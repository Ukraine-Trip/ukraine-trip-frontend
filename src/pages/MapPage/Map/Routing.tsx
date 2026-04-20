import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

interface RoutingProps {
  points: [number, number][];
}

const Routing = ({ points }: RoutingProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints: points.map((p) => L.latLng(p[0], p[1])),
      lineOptions: {
        styles: [{ color: '#302d2c', weight: 5, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 10,
      } as any,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
    } as any).addTo(map);

    return () => {
      if (map && map.removeControl && routingControl) {
        try {
          map.removeControl(routingControl);
        } catch (e) {
          console.warn('Leaflet routing cleanup safety trigger', e);
        }
      }
    };
  }, [map, points]);

  return null;
};

export default Routing;
