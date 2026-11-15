import {describe, expect, it} from 'vitest';
import {
  TIERS,
  TREE_LIGHTS,
  createTreeBody,
  treeLightColor,
} from './christmasTree';

const garland = TREE_LIGHTS.slice(0, -1);
const star = TREE_LIGHTS.length - 1;

describe('sapin', () => {
  it('tient le tronc et les branches dans une seule géométrie colorée', () => {
    const body = createTreeBody();
    expect(body.attributes.color.count).toBe(body.attributes.position.count);
    body.computeBoundingBox();
    expect(body.boundingBox!.min.y).toBeCloseTo(0);
    expect(body.boundingBox!.max.y).toBeCloseTo(0.88);
  });

  it('pose chaque lumière de la guirlande sur les branches de son étage', () => {
    let index = 0;
    for (const tier of TIERS) {
      for (let i = 0; i < tier.lights; i++, index++) {
        const {position} = garland[index];
        const rise = (position.y - tier.base) / tier.height;
        const branch = tier.radius * (1 - rise);
        expect(rise).toBeGreaterThan(0);
        expect(rise).toBeLessThan(1);
        expect(Math.hypot(position.x, position.z)).toBeCloseTo(branch, 1);
      }
    }
    expect(index).toBe(garland.length);
  });

  it('change la couleur de chaque lumière à chaque pas, et garde l’étoile dorée', () => {
    garland.forEach((_, index) =>
      expect(treeLightColor(index, 1)).not.toBe(treeLightColor(index, 0)),
    );
    expect(treeLightColor(0, 4)).toBe(treeLightColor(0, 0));
    expect(treeLightColor(star, 1)).toBe(treeLightColor(star, 0));
  });
});
