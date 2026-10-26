import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

export type ConfigurationOptions = {
  debug: boolean;
  hideWallsShader: boolean;
  heatmapShader: boolean;
  shadows: boolean;
  webGPU: boolean;
  // Catégories d'étiquettes masquées dans la vue 3D (voir labelCategories).
  hiddenCategories: string[];
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
  /** Heure d'essai de l'éclairage et du thème, non mémorisée ; `null` : l'heure réelle. */
  simulatedHour: number | null;
  setSimulatedHour: Dispatch<SetStateAction<number | null>>;
  /** Panneau d'essai de l'éclairage, ouvert sur la vue 3D. */
  lightingTrial: boolean;
  setLightingTrial: Dispatch<SetStateAction<boolean>>;
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
  hiddenCategories: [],
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
  simulatedHour: null,
  setSimulatedHour: () => {},
  lightingTrial: false,
  setLightingTrial: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({children}: {children: React.ReactNode}) => {
  const [configuration, setConfiguration] = useState(loadConfiguration);
  const [rendererInfo, setRendererInfo] = useState(defaultRendererInfo);
  const [simulatedHour, setSimulatedHour] = useState<number | null>(null);
  const [lightingTrial, setLightingTrial] = useState(false);

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
        simulatedHour,
        setSimulatedHour,
        lightingTrial,
        setLightingTrial,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
