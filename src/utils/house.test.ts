import {describe, expect, it} from 'vitest';
import type {HouseConfigType} from '../configs/house';
import {getHouseLightIds} from './house';

const position = {x: 0, y: 0, z: 0};

describe('getHouseLightIds', () => {
  it('liste les lumières de toutes les pièces, sans doublon', () => {
    const house: HouseConfigType = {
      rooms: [
        {
          id: 'salon',
          name: 'Salon',
          position,
          items: [
            {type: 'light', roomDisplay: true, lightEntityId: 'light.salon'},
            {type: 'shutter', position, shutterEntityId: 'cover.salon'},
          ],
        },
        {id: 'couloir', name: 'Couloir', position},
        {
          id: 'cuisine',
          name: 'Cuisine',
          position,
          items: [
            {type: 'light', position, lightEntityId: 'light.cuisine'},
            {type: 'light', roomDisplay: true, lightEntityId: 'light.salon'},
          ],
        },
      ],
    };

    expect(getHouseLightIds(house)).toEqual(['light.salon', 'light.cuisine']);
  });
});
