import {HouseConfigType} from './house';
import {SideBarConfigType} from './sidebar';

export const HouseConfigsName: string[] = JSON.parse(
  import.meta.env.VITE_HOUSE_CONFIGS || '[]'
);

export type ConfigType = {
  id: string;
  name: string;
  house: HouseConfigType;
  sideBar: SideBarConfigType;
};

export const loadConfig = async (configId = HouseConfigsName[0]) => {
  try {
    const module = await import(`./${configId}/House.ts`);
    return {
      id: configId,
      name: module.ConfigName,
      house: module.HouseConfig,
      sideBar: module.SideBarConfig,
    } as ConfigType;
  } catch (error) {
    console.error(`Failed to load config: ${configId}`, error);
    return null;
  }
};
