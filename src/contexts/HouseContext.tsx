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

type configType = ConfigType | undefined;

type HouseContextType = {
  config: configType;
  setConfig: Dispatch<SetStateAction<configType>>;
  houseRef: RefObject<HTMLDivElement> | null;
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
  const [config, setConfig] = useState<configType>(undefined);
  const houseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function updateConfig() {
      const configName = window.localStorage.getItem('config') || undefined;
      const config = await loadConfig(configName);
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

  return (
    <HouseContext.Provider value={{config, setConfig, houseRef}}>
      {children}
    </HouseContext.Provider>
  );
};
