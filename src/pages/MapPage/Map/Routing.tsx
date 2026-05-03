import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

interface RoutingProps {
  points: [number, number][];
}

const Routing: React.FC<RoutingProps> = ({ points }) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!map || points.length < 2) return;

    // Створюємо новий контроль
    const routingControl = L.Routing.control({
      waypoints: points.map((p) => L.latLng(p[0], p[1])),
      lineOptions: {
        styles: [{ color: '#444', weight: 5, opacity: 0.7 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
    }).addTo(map);

    routingControlRef.current = routingControl;

    // Очисний ефект (cleanup) з перевіркою
    return () => {
      if (routingControlRef.current && map) {
        try {
          // Використовуємо вбудований метод Leaflet для видалення контролю
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        } catch (error) {
          // Якщо мапа вже розмонтована, ми просто ігноруємо помилку, щоб не крашити додаток
          console.warn('Routing cleanup bypassed to prevent crash.');
        }
      }
    };
  }, [map, points]);

  return null;
};

export default Routing;
