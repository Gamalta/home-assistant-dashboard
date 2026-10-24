import {render, screen} from '@testing-library/react';
import {useContext} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';

function Configuration(props: {context: typeof import('./AppContext')}) {
  const {configuration, webGPUSupported} = useContext(props.context.AppContext);
  return (
    <span>
      {`supporté : ${webGPUSupported}, activé : ${configuration.webGPU}`}
    </span>
  );
}

// Le support est détecté à l'import du module : chaque test le réimporte.
async function renderWithWebGPU(adapter: object | null) {
  vi.stubGlobal('navigator', {gpu: {requestAdapter: async () => adapter}});
  vi.resetModules();
  const context = await import('./AppContext');
  render(
    <context.AppProvider>
      <Configuration context={context} />
    </context.AppProvider>,
  );
}

describe('AppProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('garde WebGL par défaut même quand WebGPU est disponible', async () => {
    await renderWithWebGPU({});

    expect(
      screen.getByText('supporté : true, activé : false'),
    ).toBeInTheDocument();
  });

  it('respecte WebGPU quand il a été choisi', async () => {
    localStorage.setItem('graphics-options', JSON.stringify({webGPU: true}));
    await renderWithWebGPU({});

    expect(
      screen.getByText('supporté : true, activé : true'),
    ).toBeInTheDocument();
  });

  it('ignore le choix de WebGPU quand il n’est plus disponible', async () => {
    localStorage.setItem('graphics-options', JSON.stringify({webGPU: true}));
    await renderWithWebGPU(null);

    expect(
      screen.getByText('supporté : false, activé : false'),
    ).toBeInTheDocument();
  });
});
