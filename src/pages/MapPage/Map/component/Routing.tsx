import { useEffect, useRef } from 'react';
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
    this.osrmRouter.route(waypoints, callback, context);
    return this;
  }
}

const getServiceUrl = (type: TransportType): string => {
  const urls = {
    car: 'https://routing.openstreetmap.de/routed-car/route/v1',
    bike: 'https://routing.openstreetmap.de/routed-bike/route/v1',
    foot: 'https://routing.openstreetmap.de/routed-foot/route/v1',
  };
  return urls[type] || urls.car;
};

const getOSRMProfile = (type: TransportType): string => {
  const profiles = {
    car: 'driving',
    bike: 'cycling',
    foot: 'walking',
  };
  return profiles[type] || profiles.car;
};

const Routing: React.FC<RoutingProps> = ({ points, transportType }) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const transportTypeRef = useRef<TransportType>(transportType);

  useEffect(() => {
    if (!map) return;

    // Recreate the control only if it doesn't exist or if transport type has changed
    if (
      !routingControlRef.current ||
      transportTypeRef.current !== transportType
    ) {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }

      const serviceUrl = getServiceUrl(transportType);
      const profile = getOSRMProfile(transportType);

      const control = L.Routing.control({
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

      routingControlRef.current = control;
      transportTypeRef.current = transportType;
    }

    // Update waypoints on the existing control
    if (routingControlRef.current) {
      if (points.length < 2) {
        routingControlRef.current.setWaypoints([]);
      } else {
        routingControlRef.current.setWaypoints(
          points.map((p) => L.latLng(p[0], p[1]))
        );
      }
    }
  }, [map, points, transportType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map && routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map]);

  return null;
};

export default Routing;
