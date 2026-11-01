import * as THREE from 'three';

// Chaque entité pilote la première lumière du modèle dont le nom commence par
// son identifiant, sans le domaine.
export function findModelLights(model: THREE.Object3D, entityIds: string[]) {
  const lights: THREE.Light[] = [];
  model.traverse(object => {
    if (object instanceof THREE.Light) lights.push(object);
  });
  return entityIds.flatMap(entityId => {
    const prefix = entityId.split('.')[1].toLowerCase();
    return (
      lights.find(light => light.name.toLowerCase().startsWith(prefix)) ?? []
    );
  });
}
