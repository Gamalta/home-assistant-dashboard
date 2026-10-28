import {useEffect, useState} from 'react';
import {ConfigType, HouseConfigsName, loadConfig} from '../configs/configs';

// Les configs ne sont chargées qu'à l'ouverture du menu qui les liste.
export function useHouseConfigs(enabled: boolean) {
  const [configs, setConfigs] = useState<ConfigType[]>([]);

  useEffect(() => {
    if (!enabled) return;
    Promise.all(HouseConfigsName.map(name => loadConfig(name))).then(loaded =>
      setConfigs(loaded.filter(config => config !== null)),
    );
  }, [enabled]);

  return configs;
}
