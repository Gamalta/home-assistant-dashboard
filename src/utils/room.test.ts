import {describe, expect, it} from 'vitest';
import type {RoomItemConfigType} from '../configs/house';
import {filterRoomItems} from './room';

const items = [
  {type: 'light', roomDisplay: true, lightEntityId: 'light.salon'},
  {type: 'shutter', roomDisplay: true, shutterEntityId: 'cover.salon'},
  {type: 'climate', roomDisplay: true, climateEntityId: 'climate.salon'},
  {type: 'temperature', roomDisplay: true, temperatureEntityId: 'sensor.t'},
  {type: 'outlet', roomDisplay: true, switchEntityId: 'switch.tv'},
] as RoomItemConfigType[];

const types = (filtered: RoomItemConfigType[]) =>
  filtered.map(item => item.type);

describe('filterRoomItems', () => {
  it('garde tous les éléments sans filtre', () => {
    expect(filterRoomItems(items, 'all')).toBe(items);
  });

  it('ne garde que le type demandé', () => {
    expect(types(filterRoomItems(items, 'light'))).toEqual(['light']);
    expect(types(filterRoomItems(items, 'shutter'))).toEqual(['shutter']);
  });

  it('range la climatisation et les thermomètres sous Climat', () => {
    expect(types(filterRoomItems(items, 'climate'))).toEqual([
      'climate',
      'temperature',
    ]);
  });

  it('vide une pièce sans élément du type demandé', () => {
    expect(filterRoomItems(items.slice(0, 1), 'shutter')).toEqual([]);
  });
});
