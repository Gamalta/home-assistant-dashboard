import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

type ConfigurationOptions = {
  debug: boolean;
  hideWallsShader: boolean;
  heatmapShader: boolean;
};

type AppContextType = {
  configuration: ConfigurationOptions;
  setConfiguration: Dispatch<SetStateAction<ConfigurationOptions>>;
  triangle: number;
  setTriangle: Dispatch<SetStateAction<number>>;
};

const AppContext = createContext<AppContextType>({
  configuration: {debug: false, hideWallsShader: true, heatmapShader: false},
  setConfiguration: () => {},
  triangle: -1,
  setTriangle: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({children}: {children: React.ReactNode}) => {
  const [configuration, setConfiguration] = useState<ConfigurationOptions>({
    debug: false,
    hideWallsShader: false,
    heatmapShader: true,
  });
  const [triangle, setTriangle] = useState<number>(-1);

  return (
    <AppContext.Provider
      value={{
        configuration,
        setConfiguration,
        triangle,
        setTriangle,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
