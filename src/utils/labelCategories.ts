import type {ComponentType} from 'react';
import type {SvgIconProps} from '@mui/material/SvgIcon';
import LightbulbIcon from '@mui/icons-material/LightbulbOutlined';
import ComputerIcon from '@mui/icons-material/Computer';
import PowerIcon from '@mui/icons-material/PowerRounded';
import TvIcon from '@mui/icons-material/TvRounded';
import PrintIcon from '@mui/icons-material/PrintRounded';
import BatteryIcon from '@mui/icons-material/Battery60Rounded';
import {ThermostatIcon} from '../components/Icons/ThermostatIcon';
import {WindowIcon} from '../components/Icons/WindowIcon';
import type {HouseConfigType, RoomItemConfigType} from '../configs/house';

type LabelCategory = {
  id: string;
  label: string;
  icon: ComponentType<SvgIconProps>;
  types: RoomItemConfigType['type'][];
};

// Seul endroit à compléter pour un nouveau type d'item : un type absent
// de cette table n'a pas de filtre et reste toujours affiché.
export const labelCategories: LabelCategory[] = [
  {id: 'light', label: 'Lumières', icon: LightbulbIcon, types: ['light']},
  {
    id: 'climate',
    label: 'Climat',
    icon: ThermostatIcon,
    types: ['climate', 'temperature'],
  },
  {id: 'shutter', label: 'Volets', icon: WindowIcon, types: ['shutter']},
  {id: 'desktop', label: 'Ordinateurs', icon: ComputerIcon, types: ['desktop']},
  {id: 'plug', label: 'Prises', icon: PowerIcon, types: ['plug']},
  {id: 'media', label: 'Médias', icon: TvIcon, types: ['media', 'ambilight']},
  {
    id: 'printer3d',
    label: 'Imprimante 3D',
    icon: PrintIcon,
    types: ['printer3d'],
  },
  // Le détecteur de fumée n'a pas de catégorie : il reste toujours affiché.
  {id: 'battery', label: 'Piles', icon: BatteryIcon, types: ['battery']},
];

export function isLabelShown(
  type: RoomItemConfigType['type'],
  hiddenCategories: string[],
) {
  const category = labelCategories.find(c => c.types.includes(type));
  return !category || !hiddenCategories.includes(category.id);
}

// Une puce par catégorie présente dans la maison.
export function houseLabelCategories(rooms: HouseConfigType['rooms']) {
  const types = rooms.flatMap(room => (room.items ?? []).map(i => i.type));
  return labelCategories.filter(c => c.types.some(t => types.includes(t)));
}
