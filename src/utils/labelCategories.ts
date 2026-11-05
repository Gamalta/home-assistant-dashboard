import type {ComponentType} from 'react';
import type {SvgIconProps} from '@mui/material/SvgIcon';
import LightbulbIcon from '@mui/icons-material/LightbulbOutlined';
import ComputerIcon from '@mui/icons-material/Computer';
import PowerIcon from '@mui/icons-material/PowerRounded';
import TvIcon from '@mui/icons-material/TvRounded';
import BatteryIcon from '@mui/icons-material/Battery5BarRounded';
import {ThermostatIcon} from '../components/Icons/ThermostatIcon';
import {WindowIcon} from '../components/Icons/WindowIcon';
import {Printer3dIcon} from '../components/Icons/Printer3dIcon';
import {RobotVacuumIcon} from '../components/Icons/RobotVacuumIcon';
import {SmokeDetectorIcon} from '../components/Icons/SmokeDetectorIcon';
import type {HouseConfigType, RoomItemConfigType} from '../configs/house';

export type LabelCategory = {
  id: string;
  label: string;
  icon: ComponentType<SvgIconProps>;
  types: RoomItemConfigType['type'][];
  // Sans commande : masquée tant que l'utilisateur ne l'affiche pas.
  passive?: boolean;
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
  {id: 'outlet', label: 'Prises', icon: PowerIcon, types: ['outlet']},
  {id: 'tv', label: 'Télévision', icon: TvIcon, types: ['tv']},
  {
    id: 'printer3d',
    label: 'Imprimante 3D',
    icon: Printer3dIcon,
    types: ['printer3d'],
  },
  {id: 'vacuum', label: 'Aspirateur', icon: RobotVacuumIcon, types: ['vacuum']},
  {
    id: 'smoke',
    label: 'Détecteur de fumée',
    icon: SmokeDetectorIcon,
    types: ['smoke'],
  },
  {
    id: 'battery',
    label: 'Appareils sur pile',
    icon: BatteryIcon,
    types: ['battery'],
    passive: true,
  },
];

// Le choix de l'utilisateur, sinon la valeur par défaut de la catégorie.
export function isCategoryShown(
  category: LabelCategory,
  shownCategories: Record<string, boolean>,
) {
  return shownCategories[category.id] ?? !category.passive;
}

export function isLabelShown(
  type: RoomItemConfigType['type'],
  shownCategories: Record<string, boolean>,
) {
  const category = labelCategories.find(c => c.types.includes(type));
  return !category || isCategoryShown(category, shownCategories);
}

// Éléments qui donnent un niveau de pile en %.
export function hasBattery(item: RoomItemConfigType) {
  return 'batteryEntityId' in item && !!item.batteryEntityId;
}

// Une ligne par catégorie présente dans la maison.
export function houseLabelCategories(rooms: HouseConfigType['rooms']) {
  const types = rooms.flatMap(room => (room.items ?? []).map(i => i.type));
  return labelCategories.filter(c => c.types.some(t => types.includes(t)));
}
