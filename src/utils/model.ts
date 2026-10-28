import {Light, Object3D, Vector3} from 'three';
import type {HouseConfigType} from '../configs/house';

// Une entité lumière pilote la première lumière du modèle dont le nom commence
// par son identifiant, sans le domaine.
export function findModelLight(model: Object3D, entityId: string) {
  const prefix = entityId.split('.')[1].toLowerCase();
  let found: Light | undefined;
  model.traverse(object => {
    if (found || !(object instanceof Light)) return;
    if (object.name.toLowerCase().startsWith(prefix)) found = object;
  });
  return found;
}

// Centre d'une pièce : sa lampe principale, la première lumière de sa config,
// ou à défaut la position de son étiquette.
export function roomCenter(
  room: HouseConfigType['rooms'][number],
  model: Object3D,
) {
  const light = room.items?.find(item => item.type === 'light');
  const object = light && findModelLight(model, light.lightEntityId);
  if (!object) return room.position;
  const {x, y, z} = object.getWorldPosition(new Vector3());
  return {x, y, z};
}
