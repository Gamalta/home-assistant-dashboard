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

type configType = ConfigType | undefined;

type HouseContextType = {
  config: configType;
  setConfig: Dispatch<SetStateAction<configType>>;
};

const HouseContext = createContext<HouseContextType>({
  config: undefined,
  setConfig: () => {},
});

export const useHouseContext = () => useContext(HouseContext);

type HouseProviderProps = {
  children: ReactNode;
};

export const HouseProvider = (props: HouseProviderProps) => {
  const {children} = props;
  const [config, setConfig] = useState<configType>(undefined);

  useEffect(() => {
    async function updateConfig() {
      const configName = window.localStorage.getItem('config') || undefined;
      const config = await loadConfig(configName);
      setConfig(config);
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
    <HouseContext.Provider value={{config, setConfig}}>
      {children}
    </HouseContext.Provider>
  );
};
