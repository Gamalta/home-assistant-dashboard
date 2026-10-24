import {describe, expect, it} from 'vitest';
import {carouselPage} from './carousel';

// 5 cartes de 296 px espacées de 8 px, dans une zone de 328 px.
const scrollWidth = 5 * 296 + 4 * 8;
const maxScroll = scrollWidth - 328;

describe('carouselPage', () => {
  it('désigne la carte alignée à gauche', () => {
    expect(carouselPage(0, scrollWidth, 5)).toBe(0);
    expect(carouselPage(2 * 304, scrollWidth, 5)).toBe(2);
  });

  it('désigne la carte la plus proche pendant le glissement', () => {
    expect(carouselPage(304 * 1.4, scrollWidth, 5)).toBe(1);
    expect(carouselPage(304 * 1.6, scrollWidth, 5)).toBe(2);
  });

  it('désigne la dernière carte en fin de course', () => {
    expect(carouselPage(maxScroll, scrollWidth, 5)).toBe(4);
  });
});
