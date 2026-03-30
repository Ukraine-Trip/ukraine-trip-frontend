import { createBrowserRouter } from 'react-router-dom';
import {Layout} from './components/Layout/Layout';
import {HomePage} from './pages/HomePage/HomePage.tsx';
import {CreateRoutePage} from './pages/CreateRoutePage/CreateRoutePage';
import {AccountPage} from './pages/AccountPage/AccountPage';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Ваш Layout уже містить Header/Footer та Outlet
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "create-route",
        element: <CreateRoutePage />,
      },
      {
        path: "account",
        element: <AccountPage />,
      },
    ],
  },
]);