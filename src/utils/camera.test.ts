import {describe, expect, it} from 'vitest';
import {FOV, FRAMING, portraitDistance, roomCameraPose} from './camera';

const expectTuple = (actual: number[], expected: number[]) =>
  actual.forEach((value, index) => expect(value).toBeCloseTo(expected[index]));

describe('roomCameraPose', () => {
  it('vise le centre de la pièce dans la direction de la caméra du modèle', () => {
    const {position, target} = roomCameraPose(
      {x: 2, y: 2.5, z: 3},
      [0, 7, -7],
      4,
      0,
    );

    expectTuple(target, [2, 2.5, 3]);
    expectTuple(position, [2, 2.5 + 4 * Math.SQRT1_2, 3 - 4 * Math.SQRT1_2]);
  });

  it('avance la cible vers la caméra pour remonter la pièce à l’écran', () => {
    const {target} = roomCameraPose({x: 2, y: 2.5, z: 3}, [0, 7, -7], 4, 0.5);

    expectTuple(target, [2, 2.5, 1]);
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

describe('FRAMING', () => {
  it('garde à 30° la hauteur de scène que la caméra voyait à 75°', () => {
    const height = (fov: number, distance: number) =>
      2 * distance * Math.tan((fov * Math.PI) / 360);

    expect(FOV).toBe(30);
    expect(height(FOV, 10 * FRAMING)).toBeCloseTo(height(75, 10));
    expect(FRAMING).toBeCloseTo(2.86, 2);
  });
});
