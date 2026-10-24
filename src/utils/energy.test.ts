import {describe, expect, it} from 'vitest';
import {
  type EnergyStatistic,
  formatCost,
  formatEnergy,
  formatPower,
  getCost,
  getDailyConsumption,
  getSubscribedPower,
  getTariffPeriod,
  toKWh,
} from './energy';

// Ligne quotidienne de Home Assistant, pour le jour local `day` (AAAA-MM-JJ).
const row = (day: string, change: number, state: number): EnergyStatistic => ({
  start: new Date(`${day}T00:00`).getTime(),
  change,
  state,
});

const statistics = {
  peak: [row('2026-10-21', 5, 1005), row('2026-10-22', 6, 1011)],
  offPeak: [row('2026-10-21', 3, 503), row('2026-10-22', 2, 505)],
};

describe('toKWh', () => {
  it('convertit les index en Wh, kWh et MWh', () => {
    expect(toKWh('12500', 'Wh')).toBe(12.5);
    expect(toKWh('12.5', 'kWh')).toBe(12.5);
    expect(toKWh('0.0125', 'MWh')).toBe(12.5);
  });

  it('ne devine ni un index indisponible ni une unité inconnue', () => {
    expect(toKWh('unavailable', 'kWh')).toBeNull();
    expect(toKWh(undefined, 'kWh')).toBeNull();
    expect(toKWh('', 'kWh')).toBeNull();
    expect(toKWh('12.5', undefined)).toBeNull();
    expect(toKWh('12.5', 'kVA')).toBeNull();
  });
});

describe('getTariffPeriod', () => {
  it('reconnaît la PTEC du mode historique', () => {
    expect(getTariffPeriod('HC..')).toBe('offPeak');
    expect(getTariffPeriod('HP..')).toBe('peak');
    expect(getTariffPeriod('HCJB')).toBe('offPeak');
    expect(getTariffPeriod('HPJR')).toBe('peak');
  });

  it('reconnaît le libellé du mode standard', () => {
    expect(getTariffPeriod('HEURES CREUSES')).toBe('offPeak');
    expect(getTariffPeriod('Heure pleine')).toBe('peak');
  });

  it('ne choisit rien hors heures pleines et creuses', () => {
    expect(getTariffPeriod('TH..')).toBeNull();
    expect(getTariffPeriod('unavailable')).toBeNull();
    expect(getTariffPeriod(undefined)).toBeNull();
  });
});

describe('getDailyConsumption', () => {
  it('prend les jours passés dans les statistiques et calcule aujourd’hui avec l’index courant', () => {
    const days = getDailyConsumption(
      statistics,
      {peak: 1013.5, offPeak: 506},
      3,
      new Date('2026-10-23T15:00'),
    );

    expect(days).toEqual([
      {start: new Date('2026-10-21T00:00').getTime(), peak: 5, offPeak: 3},
      {start: new Date('2026-10-22T00:00').getTime(), peak: 6, offPeak: 2},
      {start: new Date('2026-10-23T00:00').getTime(), peak: 2.5, offPeak: 1},
    ]);
  });

  it('repart de l’index de la veille au changement de jour', () => {
    const withToday = {
      peak: [...statistics.peak, row('2026-10-23', 3, 1014)],
      offPeak: [...statistics.offPeak, row('2026-10-23', 1, 506)],
    };
    const indexes = {peak: 1014, offPeak: 506.2};

    const [beforeYesterday, beforeToday] = getDailyConsumption(
      withToday,
      indexes,
      2,
      new Date('2026-10-23T23:59'),
    );
    expect(beforeYesterday).toMatchObject({peak: 6, offPeak: 2});
    expect(beforeToday.peak).toBe(3);
    expect(beforeToday.offPeak).toBeCloseTo(1.2);

    const [afterYesterday, afterToday] = getDailyConsumption(
      withToday,
      indexes,
      2,
      new Date('2026-10-24T00:01'),
    );
    expect(afterYesterday).toMatchObject({peak: 3, offPeak: 1});
    expect(afterToday.peak).toBe(0);
    expect(afterToday.offPeak).toBeCloseTo(0.2);
  });

  it('ignore la statistique partielle du jour, en retard d’une heure', () => {
    const withPartialToday = {
      peak: [...statistics.peak, row('2026-10-23', 1, 1012)],
      offPeak: [...statistics.offPeak, row('2026-10-23', 0, 505)],
    };

    const [today] = getDailyConsumption(
      withPartialToday,
      {peak: 1013.5, offPeak: 506},
      1,
      new Date('2026-10-23T15:00'),
    );

    expect(today).toMatchObject({peak: 2.5, offPeak: 1});
  });

  it('laisse vide aujourd’hui sans index courant, sans relever la veille ou après une remise à zéro', () => {
    const now = new Date('2026-10-23T15:00');

    const [, withoutIndex] = getDailyConsumption(
      statistics,
      {peak: null, offPeak: 506},
      2,
      now,
    );
    expect(withoutIndex).toMatchObject({peak: null, offPeak: 1});

    const [withoutYesterday] = getDailyConsumption(
      statistics,
      {peak: 1013.5, offPeak: 506},
      1,
      new Date('2026-10-25T15:00'),
    );
    expect(withoutYesterday).toMatchObject({peak: null, offPeak: null});

    const [, afterReset] = getDailyConsumption(
      statistics,
      {peak: 2, offPeak: 506},
      2,
      now,
    );
    expect(afterReset).toMatchObject({peak: null, offPeak: 1});
  });

  it('compte zéro, et non une remise à zéro, pour un index à peine inférieur à celui de la veille', () => {
    const [today] = getDailyConsumption(
      statistics,
      {peak: 1010.9995, offPeak: 505.678},
      1,
      new Date('2026-10-23T05:00'),
    );

    expect(today.peak).toBe(0);
    expect(today.offPeak).toBeCloseTo(0.678);
  });

  it('laisse vide un jour passé absent des statistiques', () => {
    const withGap = {
      peak: [row('2026-10-20', 4, 1000), row('2026-10-22', 6, 1011)],
      offPeak: [row('2026-10-20', 3, 500), row('2026-10-22', 2, 505)],
    };

    const [before, first, gap, last] = getDailyConsumption(
      withGap,
      {peak: null, offPeak: null},
      5,
      new Date('2026-10-23T15:00'),
    );

    expect(before).toMatchObject({peak: null, offPeak: null});
    expect(first).toMatchObject({peak: 4, offPeak: 3});
    expect(gap).toMatchObject({peak: null, offPeak: null});
    expect(last).toMatchObject({peak: 6, offPeak: 2});
  });
});

describe('getCost', () => {
  const prices = {peak: 0.25, offPeak: 0.2};

  it('additionne les heures pleines et creuses à leur tarif', () => {
    expect(getCost({start: 0, peak: 4, offPeak: 5}, prices)).toBe(2);
  });

  it('ne donne pas de coût partiel', () => {
    expect(getCost({start: 0, peak: 4, offPeak: null}, prices)).toBeNull();
  });
});

describe('getSubscribedPower', () => {
  it('compte 200 V par ampère souscrit', () => {
    expect(getSubscribedPower(30)).toBe(6000);
    expect(getSubscribedPower(45)).toBe(9000);
  });

  it('ne divise jamais par une intensité nulle ou absente', () => {
    expect(getSubscribedPower(0)).toBeNull();
    expect(getSubscribedPower(null)).toBeNull();
  });
});

describe('formatage', () => {
  it('passe en kVA à partir de 1 000 VA', () => {
    expect(formatPower(450, 'VA')).toBe('450 VA');
    expect(formatPower(1234, 'VA')).toBe('1,2 kVA');
    expect(formatPower(2500, 'W')).toBe('2,5 kW');
  });

  it('écrit l’énergie au dixième de kWh et le coût au centime', () => {
    expect(formatEnergy(3.44)).toBe('3,4 kWh');
    expect(formatEnergy(0)).toBe('0 kWh');
    expect(formatCost(1.234)).toMatch(/^1,23\s€$/);
  });

  it('affiche un tiret sans valeur', () => {
    expect(formatPower(null, 'VA')).toBe('—');
    expect(formatEnergy(null)).toBe('—');
    expect(formatCost(null)).toBe('—');
  });
});
