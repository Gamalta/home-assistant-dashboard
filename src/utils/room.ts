import type {RoomItemConfigType} from '../configs/house';

export type RoomFilter = 'all' | 'light' | 'shutter' | 'climate';

const FILTER_TYPES: Record<RoomFilter, RoomItemConfigType['type'][] | null> = {
  all: null,
  light: ['light'],
  shutter: ['shutter'],
  climate: ['climate', 'temperature'],
};

export function filterRoomItems(
  items: RoomItemConfigType[],
  filter: RoomFilter,
) {
  const types = FILTER_TYPES[filter];
  return types ? items.filter(item => types.includes(item.type)) : items;
}
