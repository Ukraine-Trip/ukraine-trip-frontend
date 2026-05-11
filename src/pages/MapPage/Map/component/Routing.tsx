import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

type TransportType = 'car' | 'foot' | 'bike';

interface RoutingProps {
  points: [number, number][];
  transportType: TransportType;
}

class CustomRouter implements L.Routing.IRouter {
  private osrmRouter: L.Routing.OSRMv1;

  constructor(options: L.Routing.OSRMOptions) {
    this.osrmRouter = new L.Routing.OSRMv1(options);
  }

  public route(
    waypoints: L.Routing.Waypoint[],
    callback: (error?: L.Routing.IError, routes?: L.Routing.IRoute[]) => void,
    context?: object
  ): this {
    this.osrmRouter.route(
      waypoints,
      (error?: L.Routing.IError, routes?: L.Routing.IRoute[]) => {
        if (error || !routes || routes.length === 0) {
          console.error('Помилка маршрутизації OSRM:', error);
          callback.call(context, error, routes);
          return;
        }

        const originalRoute = routes[0];
        const newCoordinates = [...originalRoute.coordinates];

        const startWaypoint = waypoints[0].latLng;
        if (newCoordinates.length > 0) {
          const firstRoutePoint = newCoordinates[0];
          if (startWaypoint.distanceTo(firstRoutePoint) > 1) {
            newCoordinates.unshift(startWaypoint);
          }
        }

        const endWaypoint = waypoints[waypoints.length - 1].latLng;
        if (newCoordinates.length > 0) {
          const lastRoutePoint = newCoordinates[newCoordinates.length - 1];
          if (endWaypoint.distanceTo(lastRoutePoint) > 1) {
            newCoordinates.push(endWaypoint);
          }
        }

        originalRoute.coordinates = newCoordinates;

        callback.call(context, undefined, [originalRoute]);
      },
      context
    );

    return this;
  }
}

const Routing: React.FC<RoutingProps> = ({ points, transportType }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length < 2) return;

    const serviceUrl = `https://router.project-osrm.org/route/v1`;

    const router = new CustomRouter({
      serviceUrl: serviceUrl,
      profile: transportType,
    });

    const routingControl = L.Routing.control({
      waypoints: points.map((p) => L.latLng(p[0], p[1])),
      router: router,
      lineOptions: {
        styles: [{ color: '#2A6FD9', weight: 5, opacity: 0.8 }],
        extendToWaypoints: false,
        missingRouteTolerance: 100,
      },
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: false,
      createMarker: () => null,
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        try {
          map.removeControl(routingControl);
        } catch (e) {
          console.error('Не вдалося видалити контроль маршрутизації:', e);
        }
      }
    };
  }, [map, points, transportType]);

  return null;
};

export default Routing;
