import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';


function App() {
  return (
      <AuthProvider>
        <CssBaseline />
        <RouterProvider router={router} />
      </AuthProvider>
  );
}

export default App;
