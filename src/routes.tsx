import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CreateRoutePage } from './pages/CreateRoutePage';
import { AccountPage } from './pages/AccountPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { MapComponent } from './pages/MapPage/Map';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CreateLocationPage } from './pages/CreateLocationPage';
import { CityPage } from './pages/CityPage';
import { ItineraryPage } from './pages/ItineraryPage';
import { MyLocationsPage } from './pages/MyLocationsPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { TripDetailsPage } from './pages/TripDetailsPage';
import { EditTripPage } from './pages/EditTripPage';
import { TripsPage } from './pages/TripsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'trips', // <-- 2. Додали новий роут для всіх маршрутів
        element: <TripsPage />,
      },
      {
        path: 'create-route',
        element: <CreateRoutePage />,
      },
      {
        path: 'account',
        element: <AccountPage />,
      },
      {
        path: 'map-page',
        element: <MapComponent />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'create-location',
        element: <CreateLocationPage />,
      },
      {
        path: 'city/:cityName',
        element: <CityPage />,
      },
      {
        path: 'itinerary',
        element: <ItineraryPage />,
      },
      {
        path: 'my-locations',
        element: <MyLocationsPage />,
      },
      {
        path: 'my-trips',
        element: <MyTripsPage />,
      },
      {
        path: 'trip/:id',
        element: <TripDetailsPage />,
      },
      {
        path: 'trip/:id/edit',
        element: <EditTripPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
