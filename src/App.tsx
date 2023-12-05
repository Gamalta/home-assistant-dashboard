import { ThemeProvider } from '@hakit/components';
import { HassConnect } from '@hakit/core';
import Dashboard from './Dashboard';

function App() {
  return (
    <HassConnect hassUrl={"https://homeeli.duckdns.org:20000"}>
      <ThemeProvider includeThemeControls />
      <Dashboard />
    </HassConnect>
  );
}

export default App;
