//import {HassConnect} from '@hakit/core';
import Dashboard from './Dashboard';
import {HassConnect} from '@hakit/core';
import {ThemeProvider} from './contexts/ThemeProvider';
import {Analytics} from '@vercel/analytics/react';
import {SpeedInsights} from '@vercel/speed-insights/react';
import {useEffect} from 'react';

function App() {
  useEffect(() => {
    if (window.location.pathname !== '/') {
      window.location.pathname = '/';
    }
  }, []);

  return (
    <>
      <ThemeProvider>
        <HassConnect hassUrl={import.meta.env.VITE_HA_URL}>
          <Dashboard />
        </HassConnect>
      </ThemeProvider>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
