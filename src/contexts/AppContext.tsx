import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type {LightingStyleId} from '../rendering/lightingStyles';

export type ConfigurationOptions = {
  debug: boolean;
  hideWallsShader: boolean;
  heatmapShader: boolean;
  shadows: boolean;
  webGPU: boolean;
  /** Délai avant la veille de l'écran, en minutes ; 0 la désactive. */
  screensaverMinutes: number;
  // Catégories d'étiquettes masquées dans la vue 3D (voir labelCategories).
  hiddenCategories: string[];
  lightingStyle: LightingStyleId;
};

export type RendererInfo = {
  triangles: number;
  maxTextures: number | null;
  gpu: string | null;
};

type AppContextType = {
  configuration: ConfigurationOptions;
  setConfiguration: Dispatch<SetStateAction<ConfigurationOptions>>;
  webGLSupported: boolean;
  webGPUSupported: boolean;
  rendererInfo: RendererInfo;
  setRendererInfo: Dispatch<SetStateAction<RendererInfo>>;
};

const STORAGE_KEY = 'graphics-options';

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

async function detectWebGPU() {
  try {
    return !!(await navigator.gpu?.requestAdapter());
  } catch {
    return false;
  }
}

const webGLSupported = detectWebGL();
const webGPUSupported = await detectWebGPU();

const defaultConfiguration: ConfigurationOptions = {
  debug: false,
  hideWallsShader: true,
  heatmapShader: false,
  shadows: false,
  webGPU: false,
  screensaverMinutes: 0,
  // Les piles sont une information de diagnostic, affichée à la demande.
  hiddenCategories: ['battery'],
  lightingStyle: 'soleil',
};

const defaultRendererInfo: RendererInfo = {
  triangles: -1,
  maxTextures: null,
  gpu: null,
};

function loadConfiguration(): ConfigurationOptions {
  let stored: Partial<ConfigurationOptions> = {};
  try {
    stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    /* */
  }
  const configuration = {...defaultConfiguration, ...stored};
  return {...configuration, webGPU: webGPUSupported && configuration.webGPU};
}

export const AppContext = createContext<AppContextType>({
  configuration: defaultConfiguration,
  setConfiguration: () => {},
  webGLSupported,
  webGPUSupported,
  rendererInfo: defaultRendererInfo,
  setRendererInfo: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({children}: {children: React.ReactNode}) => {
  const [configuration, setConfiguration] = useState(loadConfiguration);
  const [rendererInfo, setRendererInfo] = useState(defaultRendererInfo);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configuration));
    } catch {
      /* */
    }
  }, [configuration]);

  return (
    <AppContext.Provider
      value={{
        configuration,
        setConfiguration,
        webGLSupported,
        webGPUSupported,
        rendererInfo,
        setRendererInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
