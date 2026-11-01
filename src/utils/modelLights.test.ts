import {describe, expect, it} from 'vitest';
import * as THREE from 'three';
import {findModelLights} from './modelLights';

const named = <T extends THREE.Object3D>(object: T, name: string) =>
  Object.assign(object, {name});

const shade = named(new THREE.Mesh(), 'Corridor_Light_Shade');
const corridor = named(new THREE.SpotLight(), 'Corridor_Light');
const corridor2 = named(new THREE.SpotLight(), 'Corridor_Light_2');
const kitchen = named(new THREE.PointLight(), 'Kitchen_Light');
const model = new THREE.Group().add(shade, corridor, corridor2, kitchen);

describe('findModelLights', () => {
  it('pilote la première lumière dont le nom commence par l’identifiant', () => {
    expect(findModelLights(model, ['light.corridor_light'])).toEqual([
      corridor,
    ]);
  });

  it('donne la lumière de chaque membre d’un groupe', () => {
    const members = ['light.corridor_light', 'light.corridor_light_2'];

    expect(findModelLights(model, members)).toEqual([corridor, corridor2]);
  });

  it('ignore les membres sans lumière dans le modèle', () => {
    const members = ['light.led_strip', 'light.kitchen_light'];

    expect(findModelLights(model, members)).toEqual([kitchen]);
  });
});
