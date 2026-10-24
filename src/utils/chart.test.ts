import {describe, expect, it} from 'vitest';
import {
  alignHistories,
  chartDomain,
  formatTime,
  isHistoryLoading,
  parseValue,
  stackValues,
  valueRange,
} from './chart';

const MINUTE = 60 * 1000;
// Un état à `minutes` minutes de l'origine, `lu` étant en secondes.
const at = (minutes: number, s: string) => ({s, lu: (minutes * MINUTE) / 1000});

describe('parseValue', () => {
  it('garde zéro et fait un trou des états indisponibles', () => {
    expect(parseValue('0')).toBe(0);
    expect(parseValue('21.5')).toBe(21.5);
    expect(parseValue('unavailable')).toBeNull();
    expect(parseValue('unknown')).toBeNull();
    expect(parseValue('')).toBeNull();
  });
});

describe('formatTime', () => {
  it('donne l’heure et les minutes', () => {
    expect(formatTime(new Date(2026, 9, 24, 9, 5).getTime())).toBe('09:05');
    expect(formatTime(new Date(2026, 9, 24, 14, 30).toISOString())).toBe(
      '14:30',
    );
  });
});

describe('isHistoryLoading', () => {
  it('attend que les états soient fournis', () => {
    expect(isHistoryLoading(undefined)).toBe(true);
    expect(isHistoryLoading({loading: true, entityHistory: []})).toBe(true);
    expect(isHistoryLoading({loading: false})).toBe(true);
    expect(isHistoryLoading({loading: false, entityHistory: []})).toBe(false);
  });
});

describe('alignHistories', () => {
  it('aligne deux historiques sur des pas de 15 minutes', () => {
    const {x, data} = alignHistories([
      [at(0, '20'), at(31, '21')],
      [at(14, '50')],
    ]);

    expect(x).toEqual([0, 30 * MINUTE]);
    expect(data).toEqual([
      [20, 21],
      [50, 50],
    ]);
  });

  it('prolonge une valeur jusqu’au changement suivant', () => {
    const {data} = alignHistories([
      [at(0, '20'), at(60, '22')],
      [at(0, '50'), at(15, '51'), at(30, '52'), at(45, '53')],
    ]);

    expect(data[0]).toEqual([20, 20, 20, 20, 22]);
  });

  it('ne trace rien avant le premier état connu', () => {
    const {data} = alignHistories([[at(0, '20')], [at(30, '50')]]);

    expect(data[1]).toEqual([null, 50]);
  });

  it('laisse un trou tant que le capteur est indisponible', () => {
    const {data} = alignHistories([
      [at(0, '0'), at(15, 'unavailable'), at(45, '3')],
      [at(30, '50')],
    ]);

    expect(data[0]).toEqual([0, null, null, 3]);
  });

  it('garde le dernier état d’un même pas', () => {
    const {data} = alignHistories([[at(0, '20'), at(5, '21'), at(10, '22')]]);

    expect(data).toEqual([[22]]);
  });

  it('accepte un autre pas', () => {
    const {x} = alignHistories(
      [[at(0, '1'), at(3, '2'), at(7, '3')]],
      5 * MINUTE,
    );

    expect(x).toEqual([0, 5 * MINUTE]);
  });
});

describe('valueRange', () => {
  it('ignore les trous', () => {
    expect(valueRange([null, 3, -1, null, 7])).toEqual({min: -1, max: 7});
  });

  it('ne renvoie rien sans valeur', () => {
    expect(valueRange([])).toBeNull();
    expect(valueRange([null, null])).toBeNull();
  });
});

describe('stackValues', () => {
  it('additionne les séries point par point', () => {
    expect(
      stackValues([
        [1, 2, null, null],
        [3, null, 4, null],
      ]),
    ).toEqual([4, 2, 4, null]);
  });
});

describe('chartDomain', () => {
  it('laisse 10 % de marge sous la courbe et le tiers haut libre', () => {
    expect(chartDomain([20, null, 30])).toEqual({min: 19, max: 35.5});
  });

  it('respecte les bornes imposées', () => {
    expect(chartDomain([500, 2000], {min: 0})).toEqual({min: 0, max: 3000});
    expect(chartDomain([500, 2000], {min: 0, max: 2500})).toEqual({
      min: 0,
      max: 2500,
    });
  });

  it('donne une hauteur à une courbe plate', () => {
    const {min, max} = chartDomain([21, 21]);

    expect(min).toBeLessThan(21);
    expect(max).toBeGreaterThan(21);
    expect(chartDomain([0, 0], {min: 0}).max).toBeGreaterThan(0);
  });

  it('se contente des bornes imposées sans valeur', () => {
    expect(chartDomain([null], {min: 0})).toEqual({min: 0});
  });
});
