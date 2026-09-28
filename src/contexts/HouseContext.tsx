import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {ConfigType, loadConfig} from '../configs/configs';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

type HouseContextType = {
  houseConfig: ConfigType | undefined;
  setHouseConfig: Dispatch<SetStateAction<ConfigType | undefined>>;
};

export const HouseContext = createContext<HouseContextType>({
  houseConfig: undefined,
  setHouseConfig: () => {},
});

export const useHouseContext = () => useContext(HouseContext);

type HouseProviderProps = {
  children: ReactNode;
};

export const HouseProvider = (props: HouseProviderProps) => {
  const {children} = props;
  const [houseConfig, setHouseConfig] = useState<ConfigType | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function updateConfig() {
      const configName = window.localStorage.getItem('config') || undefined;
      const config = await loadConfig(configName);
      setIsLoading(false);
      if (config) setHouseConfig(config);
    }
    updateConfig();
  }, [setHouseConfig]);

  useEffect(() => {
    if (!houseConfig) return;
    // On mémorise l'identifiant (et non le nom affiché) de la configuration.
    if (window.localStorage.getItem('config') !== houseConfig.id) {
      window.localStorage.setItem('config', houseConfig.id);
    }
  }, [houseConfig]);

  if (isLoading) {
    return (
      <Stack
        sx={{height: '100vh', justifyContent: 'center', alignItems: 'center'}}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (!houseConfig) {
    return (
      <Stack
        sx={{height: '100vh', justifyContent: 'center', alignItems: 'center'}}
      >
        <Alert severity="error" variant="filled">
          Impossible de charger la configuration.
        </Alert>
      </Stack>
    );
  }

  return (
    <HouseContext.Provider value={{houseConfig, setHouseConfig}}>
      {children}
    </HouseContext.Provider>
  );
};
