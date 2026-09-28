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
  view3d: boolean;
  hideWallsShader: boolean;
  heatmapShader: boolean;
  /** Reflets de l'environnement (IBL) ; sinon éclairage diffus seul. */
  environmentReflections: boolean;
  webGPU: boolean;
};

export type RendererInfo = {
  triangles: number;
  maxTextures: number | null;
};

type AppContextType = {
  configuration: ConfigurationOptions;
  setConfiguration: Dispatch<SetStateAction<ConfigurationOptions>>;
  webGLSupported: boolean;
  /** null tant que la détection (asynchrone) n'est pas terminée. */
  webGPUSupported: boolean | null;
  rendererInfo: RendererInfo;
  setRendererInfo: Dispatch<SetStateAction<RendererInfo>>;
};

const STORAGE_KEY = 'graphics-options';

const defaultConfiguration: ConfigurationOptions = {
  debug: false,
  view3d: true,
  hideWallsShader: true,
  heatmapShader: false,
  // Écart invisible à l'œil (~1/255 en moyenne) pour un coût par pixel
  // divisé par ~2 : les reflets restent disponibles dans la modale Système.
  environmentReflections: false,
  webGPU: false,
};

const defaultRendererInfo: RendererInfo = {triangles: -1, maxTextures: null};

export const AppContext = createContext<AppContextType>({
  configuration: defaultConfiguration,
  setConfiguration: () => {},
  webGLSupported: false,
  webGPUSupported: null,
  rendererInfo: defaultRendererInfo,
  setRendererInfo: () => {},
});

export const useAppContext = () => useContext(AppContext);

function readStoredConfiguration(): Partial<ConfigurationOptions> | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    // On libère tout de suite le contexte : les navigateurs en limitent le nombre.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

async function detectWebGPU() {
  try {
    // navigator.gpu peut exister sans adaptateur disponible (ex: Chrome Linux).
    return !!(await navigator.gpu?.requestAdapter());
  } catch {
    return false;
  }
}

export const AppProvider = ({children}: {children: React.ReactNode}) => {
  const [storedConfiguration] = useState(readStoredConfiguration);
  const [configuration, setConfiguration] = useState<ConfigurationOptions>({
    ...defaultConfiguration,
    ...storedConfiguration,
  });
  const [webGLSupported] = useState(detectWebGL);
  const [webGPUSupported, setWebGPUSupported] = useState<boolean | null>(null);
  const [rendererInfo, setRendererInfo] = useState(defaultRendererInfo);

  useEffect(() => {
    detectWebGPU().then(supported => {
      setWebGPUSupported(supported);
      setConfiguration(prev => ({
        ...prev,
        // Sans préférence enregistrée, on active WebGPU dès qu'il est disponible.
        webGPU: supported && (storedConfiguration?.webGPU ?? true),
      }));
    });
  }, [storedConfiguration]);

  useEffect(() => {
    if (webGPUSupported === null) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configuration));
    } catch {
      // Stockage indisponible (navigation privée...) : les options restent en mémoire.
    }
  }, [configuration, webGPUSupported]);

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
