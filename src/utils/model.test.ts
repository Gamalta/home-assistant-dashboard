import {Group, Mesh, PointLight} from 'three';
import {describe, expect, it} from 'vitest';
import type {HouseConfigType} from '../configs/house';
import {findModelLight, roomCenter} from './model';

// Une pièce décalée de (2, 0, -3), avec sa lampe au plafond.
const model = new Group();
const room = new Group();
room.position.set(2, 0, -3);
const ceiling = new PointLight();
ceiling.name = 'Living_Room_Light_Bulb';
ceiling.position.set(0.5, 2.4, 1);
const lamp = new Mesh();
lamp.name = 'living_room_light_mesh';
room.add(lamp, ceiling);
model.add(room);

const livingRoom = {
  id: 'Living_room',
  name: 'Séjour',
  position: {x: 0, y: 2.5, z: 0},
  items: [
    {type: 'shutter', roomDisplay: true, shutterEntityId: 'cover.living_room'},
    {
      type: 'light',
      roomDisplay: true,
      lightEntityId: 'light.living_room_light',
    },
  ],
} as HouseConfigType['rooms'][number];

describe('findModelLight', () => {
  it('trouve la première lumière dont le nom commence par l’entité', () => {
    expect(findModelLight(model, 'light.living_room_light')).toBe(ceiling);
  });

  it('ignore les objets qui ne sont pas des lumières', () => {
    expect(findModelLight(model, 'light.living_room_light_mesh')).toBe(
      undefined,
    );
  });
});

describe('roomCenter', () => {
  it('vise la lampe principale de la pièce, dans le repère du modèle', () => {
    expect(roomCenter(livingRoom, model)).toEqual({x: 2.5, y: 2.4, z: -2});
  });

  it('vise l’étiquette d’une pièce sans lumière dans le modèle', () => {
    const hall = {...livingRoom, items: []};
    expect(roomCenter(hall, model)).toBe(hall.position);
  });
});
