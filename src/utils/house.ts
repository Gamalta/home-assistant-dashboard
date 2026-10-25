import type {HouseConfigType} from '../configs/house';

/** Lumières de la maison, sans doublon, dans l'ordre des pièces. */
export function getHouseLightIds(house: HouseConfigType) {
  const ids = house.rooms.flatMap(room =>
    (room.items ?? []).flatMap(item =>
      item.type === 'light' ? [item.lightEntityId] : [],
    ),
  );
  return [...new Set(ids)];
}
