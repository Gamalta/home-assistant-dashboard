import React from 'react';
//import {HassConnect} from '@hakit/core';
import Dashboard from './Dashboard';
import CssBaseline from '@mui/material/CssBaseline';
import {theme} from './theme/theme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import {HassConnect} from '@hakit/core';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HassConnect hassUrl={process.env.REACT_APP_HASS_URL!}>
        <Dashboard />
      </HassConnect>
    </ThemeProvider>
  );
}

export default App;
