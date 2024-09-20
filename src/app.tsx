//import {HassConnect} from '@hakit/core';
import Dashboard from './Dashboard';
import {HassConnect} from '@hakit/core';
import {ThemeProvider} from './contexts/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <HassConnect hassUrl={import.meta.env.VITE_HA_URL}>
        <Dashboard />
      </HassConnect>
    </ThemeProvider>
  );
}

export default App;
