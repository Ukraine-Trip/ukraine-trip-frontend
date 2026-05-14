import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

type TransportType = 'car' | 'foot' | 'bike';

interface RoutingProps {
  points: [number, number][];
  transportType: TransportType;
}

// Simplified CustomRouter - just passes through to OSRMv1
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
    this.osrmRouter.route(waypoints, callback, context);
    return this;
  }
}

const getServiceUrl = (type: TransportType): string => {
  switch (type) {
    case 'car':
      return 'https://routing.openstreetmap.de/routed-car/route/v1';
    case 'bike':
      return 'https://routing.openstreetmap.de/routed-bike/route/v1';
    case 'foot':
      return 'https://routing.openstreetmap.de/routed-foot/route/v1';
    default:
      return 'https://routing.openstreetmap.de/routed-car/route/v1';
  }
};

const getOSRMProfile = (type: TransportType): string => {
  switch (type) {
    case 'car':
      return 'driving';
    case 'bike':
      return 'cycling';
    case 'foot':
      return 'walking';
    default:
      return 'driving';
  }
};

const Routing: React.FC<RoutingProps> = ({ points, transportType }) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!map || points.length < 2) {
      // Clear existing route if not enough points
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      return;
    }

    const serviceUrl = getServiceUrl(transportType);
    const profile = getOSRMProfile(transportType);

    // Remove existing control before creating a new one
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    const routingControl = L.Routing.control({
      waypoints: points.map((p) => L.latLng(p[0], p[1])),
      router: new CustomRouter({
        serviceUrl: serviceUrl,
        profile: profile,
      }),
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

    routingControlRef.current = routingControl;

    return () => {
      if (map && routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        } catch (e) {
          console.error('Не вдалося видалити контроль маршрутизації:', e);
        }
      }
    };
  }, [map, points, transportType]); // Re-run effect if map, points, or transportType changes

  return null;
};

export default Routing;
