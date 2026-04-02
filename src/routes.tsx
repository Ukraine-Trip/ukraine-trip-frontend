import { createBrowserRouter } from 'react-router-dom';
import {Layout} from './components/Layout';
import {HomePage} from './pages/HomePage';
import {CreateRoutePage} from './pages/CreateRoutePage';
import {AccountPage} from './pages/AccountPage';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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