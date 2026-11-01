import {describe, expect, it} from 'vitest';
import * as THREE from 'three';
import {findModelLights} from './modelLights';

// Comme GLTFLoader : le point retiré du nom, l'original dans `userData`.
const named = <T extends THREE.Object3D>(object: T, name: string) =>
  Object.assign(object, {name: name.replace('.', ''), userData: {name}});

const shade = named(new THREE.Mesh(), 'Corridor_Light_Shade');
const corridor = named(new THREE.SpotLight(), 'Corridor_Light');
const corridor2 = named(new THREE.SpotLight(), 'Corridor_Light_2');
const kitchen = named(new THREE.PointLight(), 'Kitchen_Light');
const strip = named(new THREE.SpotLight(), 'Bedroom_Led_Strip');
const strip1 = named(new THREE.SpotLight(), 'Bedroom_Led_Strip.001');
const strip2 = named(new THREE.SpotLight(), 'Bedroom_Led_Strip.002');
const model = new THREE.Group().add(
  shade,
  corridor,
  corridor2,
  kitchen,
  strip,
  strip1,
  strip2,
);

describe('findModelLights', () => {
  it('pilote la première lumière dont le nom commence par l’identifiant', () => {
    expect(findModelLights(model, ['light.corridor_light'])).toEqual([
      corridor,
    ]);
  });

  it('pilote aussi les copies de la lumière, comme les spots d’un ruban', () => {
    expect(findModelLights(model, ['light.bedroom_led_strip'])).toEqual([
      strip,
      strip1,
      strip2,
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
