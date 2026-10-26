import {describe, expect, it} from 'vitest';
import type {HouseConfigType, RoomItemConfigType} from '../configs/house';
import {
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
  it('affiche les étiquettes quand rien n’est masqué', () => {
    expect(isLabelShown('light', [])).toBe(true);
  });

  it('masque seulement les étiquettes de la catégorie masquée', () => {
    expect(isLabelShown('shutter', ['shutter'])).toBe(false);
    expect(isLabelShown('light', ['shutter'])).toBe(true);
  });

  it('range climatisations et thermomètres dans la même catégorie', () => {
    expect(isLabelShown('climate', ['climate'])).toBe(false);
    expect(isLabelShown('temperature', ['climate'])).toBe(false);
  });

  it('affiche toujours un type absent de la table', () => {
    // Un type ajouté par une autre branche, sans ligne dans la table.
    const type = 'smoke' as RoomItemConfigType['type'];
    const allHidden = labelCategories.map(c => c.id);
    expect(isLabelShown(type, allHidden)).toBe(true);
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
