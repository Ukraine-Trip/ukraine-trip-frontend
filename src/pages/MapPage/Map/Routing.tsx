import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

const Routing = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  const routingRef = useRef<any>(null);

  useEffect(() => {
    if (!map || points.length < 2) return;

    // Видаляємо старий маршрут перед створенням нового
    if (routingRef.current) {
      try {
        map.removeControl(routingRef.current);
      } catch {
        /* мовчазне ігнорування */
      }
    }

    try {
      routingRef.current = L.Routing.control({
        waypoints: points.map((p) => L.latLng(p[0], p[1])),
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
        }),
        lineOptions: {
          styles: [{ color: '#302d2c', weight: 5, opacity: 0.7 }],
          addWaypoints: false,
        } as any,

        // ГОЛОВНІ НАЛАШТУВАННЯ ДЛЯ ЧИСТОТИ:
        show: false, // Прибирає панель з текстом
        addWaypoints: false, // Вимикає додавання точок кліком
        draggableWaypoints: false, // Вимикає зміну маршруту мишкою
        fitSelectedRoutes: false, // Вимикає "стрибки" мапи при зумі
        waypointMode: 'none', // Повністю ігнорує технічні мітки
        createMarker: () => null, // Не створює сині точки та інші маркери
      } as any).addTo(map);
    } catch (err) {
      console.error('Routing error:', err);
    }

    return () => {
      if (routingRef.current && map) {
        const control = routingRef.current;
        setTimeout(() => {
          try {
            map.removeControl(control);
          } catch {
            /* ігноруємо */
          }
        }, 0);
      }
    };
    // Використовуємо stringify, щоб запит на сервер не йшов при кожному зумі
  }, [map, JSON.stringify(points)]);

  return null;
};

export default Routing;
