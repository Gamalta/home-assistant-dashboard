import Dashboard from './Dashboard';
import {ThemeProvider} from './contexts/ThemeProvider';
import {Analytics} from '@vercel/analytics/react';
import {SpeedInsights} from '@vercel/speed-insights/react';
import {useEffect} from 'react';
import {HassConnect} from '@hakit/core';
import {HassConnect as HassConnectMock} from './mock/HassConnectMock';

const HAConnect = import.meta.env.VITE_MOCK_HOME_ASSISTANT
  ? HassConnectMock
  : HassConnect;
function App() {
  useEffect(() => {
    if (window.location.pathname !== '/') {
      window.location.pathname = '/';
    }
  }, []);

  return (
    <>
      <ThemeProvider>
        <HAConnect hassUrl={import.meta.env.VITE_HA_URL ?? ''}>
          <Dashboard />
        </HAConnect>
      </ThemeProvider>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
