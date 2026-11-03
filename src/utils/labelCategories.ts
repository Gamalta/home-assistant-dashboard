import type {ComponentType} from 'react';
import type {SvgIconProps} from '@mui/material/SvgIcon';
import LightbulbIcon from '@mui/icons-material/LightbulbOutlined';
import ComputerIcon from '@mui/icons-material/Computer';
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
