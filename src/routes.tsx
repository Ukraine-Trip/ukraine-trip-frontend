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
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
