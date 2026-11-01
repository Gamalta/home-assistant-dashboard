import * as THREE from 'three';

const original = (light: THREE.Light) =>
  (light.userData.name ?? light.name).replace(/\.\d+$/, '');

// Chaque entité pilote la première lumière du modèle dont le nom commence par
// son identifiant, sans le domaine, avec ses copies Blender (`.001`…) : un
// ruban LED devient plusieurs spots. GLTFLoader retire le point des noms, mais
// garde l'original dans `userData`.
export function findModelLights(model: THREE.Object3D, entityIds: string[]) {
  const lights: THREE.Light[] = [];
  model.traverse(object => {
    if (object instanceof THREE.Light) lights.push(object);
  });
  return entityIds.flatMap(entityId => {
    const prefix = entityId.split('.')[1].toLowerCase();
    const first = lights.find(light =>
      light.name.toLowerCase().startsWith(prefix),
    );
    if (!first) return [];
    return lights.filter(light => original(light) === original(first));
  });
}
