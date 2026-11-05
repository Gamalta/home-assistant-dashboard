import {describe, expect, it} from 'vitest';
import type {HouseConfigType, RoomItemConfigType} from '../configs/house';
import {
  hasBattery,
  houseLabelCategories,
  isLabelShown,
  labelCategories,
} from './labelCategories';

const room = (
  items: NonNullable<HouseConfigType['rooms'][0]['items']>,
): HouseConfigType['rooms'][0] => ({
  id: 'Salon',
  name: 'Salon',
  position: {x: 0, y: 0, z: 0},
  items,
});

describe('isLabelShown', () => {
  it('affiche les étiquettes quand rien n’est choisi', () => {
    expect(isLabelShown('light', {})).toBe(true);
  });

  it('masque par défaut les appareils sur pile, qui sont passifs', () => {
    expect(isLabelShown('battery', {})).toBe(false);
    expect(isLabelShown('battery', {battery: true})).toBe(true);
  });

  it('masque seulement les étiquettes de la catégorie masquée', () => {
    expect(isLabelShown('shutter', {shutter: false})).toBe(false);
    expect(isLabelShown('light', {shutter: false})).toBe(true);
  });

  it('range climatisations et thermomètres dans la même catégorie', () => {
    expect(isLabelShown('climate', {climate: false})).toBe(false);
    expect(isLabelShown('temperature', {climate: false})).toBe(false);
  });

  it('affiche toujours un type absent de la table', () => {
    // Un type ajouté par une autre branche, sans ligne dans la table.
    const type = 'fan' as RoomItemConfigType['type'];
    const allHidden = Object.fromEntries(
      labelCategories.map(c => [c.id, false]),
    );
    expect(isLabelShown(type, allHidden)).toBe(true);
  });
});

describe('hasBattery', () => {
  it('reconnaît les éléments qui donnent un niveau de pile', () => {
    expect(
      hasBattery({
        type: 'battery',
        name: 'Interrupteur',
        batteryEntityId: 'sensor.button_battery',
        roomDisplay: true,
      }),
    ).toBe(true);
    expect(
      hasBattery({
        type: 'temperature',
        roomDisplay: true,
        temperatureEntityId: 'sensor.salon_temperature',
        batteryEntityId: 'sensor.salon_battery',
      }),
    ).toBe(true);
  });

  it('ignore un thermomètre sans pile et une lumière', () => {
    expect(
      hasBattery({
        type: 'temperature',
        roomDisplay: true,
        temperatureEntityId: 'sensor.salon_temperature',
      }),
    ).toBe(false);
    expect(
      hasBattery({type: 'light', roomDisplay: true, lightEntityId: 'light.a'}),
    ).toBe(false);
  });
});

describe('houseLabelCategories', () => {
  it('ne propose que les catégories présentes, dans l’ordre de la table', () => {
    const rooms = [
      room([
        {
          type: 'shutter',
          shutterEntityId: 'cover.salon_shutter',
          position: {x: 0, y: 0, z: 0},
        },
        {
          type: 'temperature',
          roomDisplay: true,
          temperatureEntityId: 'sensor.salon_temperature',
        },
      ]),
      room([{type: 'light', roomDisplay: true, lightEntityId: 'light.salon'}]),
    ];
    expect(houseLabelCategories(rooms).map(c => c.id)).toEqual([
      'light',
      'climate',
      'shutter',
    ]);
  });

  it('ne propose rien pour une maison sans item', () => {
    expect(houseLabelCategories([room([])])).toEqual([]);
  });
});
