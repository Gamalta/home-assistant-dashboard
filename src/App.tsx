//import {HassConnect} from '@hakit/core';
import Dashboard from './Dashboard';
import {DialogProvider} from './contexts/DialogContext';
import CssBaseline from '@mui/material/CssBaseline';
import {theme} from './theme/theme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import {HassConnect} from './mocks/hass-connect';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/settings',
      element: <div>Settings</div>,
    },
  ]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HassConnect hassUrl={process.env.REACT_APP_HASS_URL!}>
        <DialogProvider>
          <RouterProvider router={router} />
        </DialogProvider>
      </HassConnect>
    </ThemeProvider>
  );
}

export default App;
