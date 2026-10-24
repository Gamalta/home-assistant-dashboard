import {describe, expect, it} from 'vitest';
import {lightingStyles} from './lightingStyles';

describe('lightingStyles', () => {
  it('a des libellés distincts, triés de A à J', () => {
    const labels = Object.values(lightingStyles).map(style => style.label);
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels.map(label => label[0]).join('')).toBe('ABCDEFGHIJ');
  });

  it('ne donne que des couleurs hexadécimales', () => {
    for (const style of Object.values(lightingStyles)) {
      const colors = [style.sky, style.ground, style.sun];
      if ('floorTint' in style) colors.push(style.floorTint);
      if ('wallTint' in style) colors.push(style.wallTint);
      for (const color of colors) expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
