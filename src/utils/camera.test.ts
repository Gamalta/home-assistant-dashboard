import {describe, expect, it} from 'vitest';
import {portraitDistance, roomCameraPose} from './camera';

const expectTuple = (actual: number[], expected: number[]) =>
  actual.forEach((value, index) => expect(value).toBeCloseTo(expected[index]));

describe('roomCameraPose', () => {
  it('vise la pièce dans la direction de la caméra du modèle', () => {
    const {position, target} = roomCameraPose({x: 2, z: 3}, [0, 7, -7], 4, 0);

    expectTuple(target, [2, 0, 3]);
    expectTuple(position, [2, 4 * Math.SQRT1_2, 3 - 4 * Math.SQRT1_2]);
  });

  it('avance la cible vers la caméra pour remonter la pièce à l’écran', () => {
    const {target} = roomCameraPose({x: 2, z: 3}, [0, 7, -7], 4, 0.5);

    expectTuple(target, [2, 0, 1]);
  });
});

describe('portraitDistance', () => {
  it('ne recule pas une vue en paysage', () => {
    expect(portraitDistance(16 / 9)).toBe(1);
    expect(portraitDistance(1)).toBe(1);
  });

  it('recule d’autant que la vue est étroite, dans une limite', () => {
    expect(portraitDistance(0.5)).toBe(2);
    expect(portraitDistance(0.2)).toBe(2.5);
  });
});
