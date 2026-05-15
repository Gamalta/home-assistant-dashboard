import {
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {ConfigType, loadConfig} from '../configs/configs';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

type HouseContextType = {
  config: ConfigType | undefined;
  setConfig: Dispatch<SetStateAction<ConfigType | undefined>>;
  houseRef: RefObject<HTMLDivElement | null> | null;
};

const HouseContext = createContext<HouseContextType>({
  config: undefined,
  setConfig: () => {},
  houseRef: null,
});

export const useHouseContext = () => useContext(HouseContext);

type HouseProviderProps = {
  children: ReactNode;
};

export const HouseProvider = (props: HouseProviderProps) => {
  const {children} = props;
  const [config, setConfig] = useState<ConfigType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const houseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function updateConfig() {
      const configName = window.localStorage.getItem('config') || undefined;
      const config = await loadConfig(configName);
      setIsLoading(false);
      if (config) setConfig(config);
    }
    updateConfig();
  }, [setConfig]);

  useEffect(() => {
    if (!config) return;
    const oldConfigName = window.localStorage.getItem('config');

    if (oldConfigName !== config.name) {
      window.localStorage.setItem('config', config.id);
    }
  }, [config]);

  if (isLoading) {
    return (
      <Stack
        sx={{height: '100vh', justifyContent: 'center', alignItems: 'center'}}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (!config) {
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
    <HouseContext.Provider value={{config, setConfig, houseRef}}>
      {children}
    </HouseContext.Provider>
  );
};
