import Dashboard from './Dashboard';
import {ThemeProvider} from './contexts/ThemeProvider';
import {Analytics} from '@vercel/analytics/react';
import {SpeedInsights} from '@vercel/speed-insights/react';
import {useEffect} from 'react';
import {AppProvider} from './contexts/AppContext';

const {HassConnect: HAConnect} = await (import.meta.env
  .VITE_MOCK_HOME_ASSISTANT === 'true'
  ? import('./mock/HassConnectMock')
  : import('@hakit/core'));

function App() {
  useEffect(() => {
    console.log('App version:', import.meta.env.VITE_APP_VERSION);

    if (window.location.pathname !== '/') {
      window.location.pathname = '/';
    }
  }, []);

  useEffect(() => {
    const matomo = (window._mtm = window._mtm || []);
    matomo.push({'mtm.startTime': new Date().getTime(), event: 'mtm.Start'});
    const matomoScript = document.createElement('script');
    const firstScript = document.getElementsByTagName('script')[0];
    matomoScript.async = true;
    matomoScript.src = 'https://matomo.elihome.fr/js/container_viH8f2FR.js';
    firstScript?.parentNode?.insertBefore(matomoScript, firstScript);
  }, []);

  return (
    <AppProvider>
      <ThemeProvider>
        <HAConnect hassUrl={import.meta.env.VITE_HA_URL ?? ''}>
          <Dashboard />
        </HAConnect>
      </ThemeProvider>
      <Analytics />
      <SpeedInsights />
    </AppProvider>
  );
}

export default App;
