import {existsSync} from 'node:fs';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {getWeatherIcon, getWeatherIconPath} from './weather';

const at = (hour: number) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 24, hour));
};

afterEach(() => {
  vi.useRealTimers();
});

describe('getWeatherIcon', () => {
  it('affiche le soleil si la condition est absente ou inconnue', () => {
    expect(getWeatherIcon()).toBe('sunny');
    expect(getWeatherIcon('unknown')).toBe('sunny');
  });

  it('remplace le soleil par la lune le soir', () => {
    at(22);
    expect(getWeatherIcon('sunny', true)).toBe('clear-night');
    expect(getWeatherIcon('sunny')).toBe('sunny');
    expect(getWeatherIcon('rainy', true)).toBe('rainy');
  });

  it('garde le soleil en journée', () => {
    at(12);
    expect(getWeatherIcon('sunny', true)).toBe('sunny');
  });

  it('affiche un orage pour une condition exceptionnelle', () => {
    expect(getWeatherIcon('exceptional')).toBe('lightning-rainy');
  });
});

describe('getWeatherIconPath', () => {
  it('pointe vers une image de public/', () => {
    const path = getWeatherIconPath('partlycloudy');

    expect(path).toBe('weather/partlycloudy.png');
    expect(existsSync(`public/${path}`)).toBe(true);
  });
});
