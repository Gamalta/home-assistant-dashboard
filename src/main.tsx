import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './app';
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://c1fe29bdae9902ba88417b8727437ba4@o4511062045491200.ingest.de.sentry.io/4511062047391824',
  environment: import.meta.env.VITE_VERCEL_ENV || 'development',
  release: import.meta.env.VITE_SENTRY_RELEASE,
  // Attention, Default PII peut poser des problèmes de RGPD.
  sendDefaultPii: false,
});

if(import.meta.env.VITE_MOCK_HOME_ASSISTANT){
  Sentry.setTag('mock_home_assistant', true);
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
