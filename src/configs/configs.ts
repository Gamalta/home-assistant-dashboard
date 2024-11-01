import {HouseConfigType, SideBarConfigType} from './house';

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
  const module = await import(`./${configId}/House.ts`);
  return {
    id: configId,
    name: module.ConfigName,
    house: module.HouseConfig,
    sideBar: module.SideBarConfig,
  } as ConfigType;
};
