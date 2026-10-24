import {describe, expect, it} from 'vitest';
import {
  type EnergyStatistic,
  formatChange,
  formatCost,
  formatEnergy,
  formatPeriod,
  formatPower,
  getBuckets,
  getChange,
  getComparisonPeriod,
  getConsumption,
  getCost,
  getPeriod,
  getSubscribedPower,
  getTariffPeriod,
  getTotal,
  shift,
  sumConsumption,
  toKWh,
} from './energy';

// Minuit, heure locale, du jour `day` (AAAA-MM-JJ).
const local = (day: string) => new Date(`${day}T00:00`).getTime();

// Ligne de Home Assistant, pour le jour ou le mois qui commence le jour local `day`.
const row = (day: string, change: number, state: number): EnergyStatistic => ({
  start: local(day),
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

describe('getPeriod', () => {
  it('borne la semaine du lundi au lundi suivant', () => {
    const week = {
      start: local('2026-10-19'),
      end: local('2026-10-26'),
    };
    expect(getPeriod('week', new Date('2026-10-19T00:00'))).toEqual(week);
    expect(getPeriod('week', new Date('2026-10-25T23:59'))).toEqual(week);
    expect(getPeriod('week', new Date('2026-10-24T15:00'), -1)).toEqual({
      start: local('2026-10-12'),
      end: local('2026-10-19'),
    });
  });

  it('borne les mois de 28, 29, 30 et 31 jours', () => {
    expect(getPeriod('month', new Date('2026-01-31T15:00'), 1)).toEqual({
      start: local('2026-02-01'),
      end: local('2026-03-01'),
    });
    expect(getPeriod('month', new Date('2026-03-31T15:00'), -1)).toEqual({
      start: local('2026-02-01'),
      end: local('2026-03-01'),
    });
    expect(getPeriod('month', new Date('2028-02-29T15:00'))).toEqual({
      start: local('2028-02-01'),
      end: local('2028-03-01'),
    });
    expect(getPeriod('month', new Date('2026-10-24T15:00'))).toEqual({
      start: local('2026-10-01'),
      end: local('2026-11-01'),
    });
  });

  it('borne l’année, y compris depuis un 29 février', () => {
    expect(getPeriod('year', new Date('2028-02-29T15:00'), -1)).toEqual({
      start: local('2027-01-01'),
      end: local('2028-01-01'),
    });
  });
});

describe('getBuckets', () => {
  it('découpe un mois en jours, changement d’heure compris', () => {
    const days = getBuckets(getPeriod('month', new Date('2026-10-24')), 'day');

    expect(days).toHaveLength(31);
    expect(days[24]).toEqual({
      start: local('2026-10-25'),
      end: local('2026-10-26'),
    });
    expect(
      getBuckets(getPeriod('month', new Date('2028-02-10')), 'day'),
    ).toHaveLength(29);
  });

  it('découpe une année en mois', () => {
    const months = getBuckets(
      getPeriod('year', new Date('2026-10-24')),
      'month',
    );

    expect(months).toHaveLength(12);
    expect(months[1]).toEqual({
      start: local('2026-02-01'),
      end: local('2026-03-01'),
    });
  });
});

describe('getComparisonPeriod', () => {
  const october = getPeriod('month', new Date('2026-10-24T15:00'));

  it('compare à la période précédente', () => {
    expect(getComparisonPeriod('month', october, 'previous')).toEqual({
      start: local('2026-09-01'),
      end: local('2026-10-01'),
    });
    const week = getPeriod('week', new Date('2026-10-24T15:00'));
    expect(getComparisonPeriod('week', week, 'previous').start).toBe(
      local('2026-10-12'),
    );
  });

  it('compare au même mois et à la même année un an avant', () => {
    expect(getComparisonPeriod('month', october, 'lastYear')).toEqual({
      start: local('2025-10-01'),
      end: local('2025-11-01'),
    });
    const year = getPeriod('year', new Date('2026-10-24T15:00'));
    expect(getComparisonPeriod('year', year, 'lastYear')).toEqual(
      getComparisonPeriod('year', year, 'previous'),
    );
  });

  it('compare une semaine aux mêmes jours de la semaine, 52 semaines avant', () => {
    const week = getPeriod('week', new Date('2026-10-24T15:00'));
    const reference = getComparisonPeriod('week', week, 'lastYear');

    expect(reference).toEqual({
      start: local('2025-10-20'),
      end: local('2025-10-27'),
    });
    expect(new Date(reference.start).getDay()).toBe(1);
  });

  it('aligne février bissextile sur un février de 28 jours, sans 29e jour comparé', () => {
    const february = getPeriod('month', new Date('2028-02-29T15:00'));
    const reference = getComparisonPeriod('month', february, 'lastYear');

    expect(getBuckets(february, 'day')).toHaveLength(29);
    expect(getBuckets(reference, 'day')).toHaveLength(28);
    expect(reference.start).toBe(local('2027-02-01'));
  });
});

describe('getConsumption', () => {
  const days = (from: string, count: number) =>
    getBuckets(
      {
        start: local(from),
        end: shift(local(from), 'day', count),
      },
      'day',
    );

  it('prend les jours passés dans les statistiques et calcule le jour en cours avec l’index courant', () => {
    const consumption = getConsumption(
      statistics,
      {peak: 1013.5, offPeak: 506},
      days('2026-10-21', 4),
      'day',
      new Date('2026-10-23T15:00').getTime(),
    );

    expect(consumption).toEqual([
      {...days('2026-10-21', 1)[0], peak: 5, offPeak: 3},
      {...days('2026-10-22', 1)[0], peak: 6, offPeak: 2},
      {...days('2026-10-23', 1)[0], peak: 2.5, offPeak: 1},
      {...days('2026-10-24', 1)[0], peak: null, offPeak: null},
    ]);
  });

  it('repart de l’index de la veille au changement de jour', () => {
    const withToday = {
      peak: [...statistics.peak, row('2026-10-23', 3, 1014)],
      offPeak: [...statistics.offPeak, row('2026-10-23', 1, 506)],
    };
    const indexes = {peak: 1014, offPeak: 506.2};

    const [beforeYesterday, beforeToday] = getConsumption(
      withToday,
      indexes,
      days('2026-10-22', 2),
      'day',
      new Date('2026-10-23T23:59').getTime(),
    );
    expect(beforeYesterday).toMatchObject({peak: 6, offPeak: 2});
    expect(beforeToday.peak).toBe(3);
    expect(beforeToday.offPeak).toBeCloseTo(1.2);

    const [afterYesterday, afterToday] = getConsumption(
      withToday,
      indexes,
      days('2026-10-23', 2),
      'day',
      new Date('2026-10-24T00:01').getTime(),
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

    const [today] = getConsumption(
      withPartialToday,
      {peak: 1013.5, offPeak: 506},
      days('2026-10-23', 1),
      'day',
      new Date('2026-10-23T15:00').getTime(),
    );

    expect(today).toMatchObject({peak: 2.5, offPeak: 1});
  });

  it('calcule le mois en cours avec l’index de fin du mois précédent', () => {
    const monthly = {
      peak: [row('2026-08-01', 150, 1000), row('2026-09-01', 180, 1180)],
      offPeak: [row('2026-08-01', 100, 600), row('2026-09-01', 110, 710)],
    };

    const [september, october] = getConsumption(
      monthly,
      {peak: 1300, offPeak: 790},
      getBuckets(
        {start: local('2026-09-01'), end: local('2026-11-01')},
        'month',
      ),
      'month',
      new Date('2026-10-24T15:00').getTime(),
    );

    expect(september).toMatchObject({peak: 180, offPeak: 110});
    expect(october).toMatchObject({peak: 120, offPeak: 80});
  });

  it('laisse vide le jour en cours sans index courant, sans relever la veille ou après une remise à zéro', () => {
    const now = new Date('2026-10-23T15:00').getTime();

    const [, withoutIndex] = getConsumption(
      statistics,
      {peak: null, offPeak: 506},
      days('2026-10-22', 2),
      'day',
      now,
    );
    expect(withoutIndex).toMatchObject({peak: null, offPeak: 1});

    const [withoutYesterday] = getConsumption(
      statistics,
      {peak: 1013.5, offPeak: 506},
      days('2026-10-25', 1),
      'day',
      new Date('2026-10-25T15:00').getTime(),
    );
    expect(withoutYesterday).toMatchObject({peak: null, offPeak: null});

    const [, afterReset] = getConsumption(
      statistics,
      {peak: 2, offPeak: 506},
      days('2026-10-22', 2),
      'day',
      now,
    );
    expect(afterReset).toMatchObject({peak: null, offPeak: 1});
  });

  it('compte zéro, et non une remise à zéro, pour un index à peine inférieur à celui de la veille', () => {
    const [today] = getConsumption(
      statistics,
      {peak: 1010.9995, offPeak: 505.678},
      days('2026-10-23', 1),
      'day',
      new Date('2026-10-23T05:00').getTime(),
    );

    expect(today.peak).toBe(0);
    expect(today.offPeak).toBeCloseTo(0.678);
  });

  it('laisse vide un jour passé absent des statistiques', () => {
    const withGap = {
      peak: [row('2026-10-20', 4, 1000), row('2026-10-22', 6, 1011)],
      offPeak: [row('2026-10-20', 3, 500), row('2026-10-22', 2, 505)],
    };

    const [before, first, gap, last] = getConsumption(
      withGap,
      {peak: null, offPeak: null},
      days('2026-10-19', 4),
      'day',
      new Date('2026-10-23T15:00').getTime(),
    );

    expect(before).toMatchObject({peak: null, offPeak: null});
    expect(first).toMatchObject({peak: 4, offPeak: 3});
    expect(gap).toMatchObject({peak: null, offPeak: null});
    expect(last).toMatchObject({peak: 6, offPeak: 2});
  });
});

describe('getChange', () => {
  // Une consommation constante par jour, sur `count` jours à partir de `from`.
  const constant = (
    from: string,
    count: number,
    perDay: number | null,
    known = count,
  ) =>
    getBuckets(
      {start: local(from), end: shift(local(from), 'day', count)},
      'day',
    ).map((bucket, i) => ({
      ...bucket,
      peak: i < known ? perDay : null,
      offPeak: i < known && perDay !== null ? 0 : null,
    }));

  it('compare deux périodes écoulées sur leur total, quelle que soit leur longueur', () => {
    const february = constant('2026-02-01', 28, 10);
    const january = constant('2026-01-01', 31, 10);

    expect(
      getChange(february, january, new Date('2026-03-10').getTime()),
    ).toBeCloseTo(280 / 310 - 1);
  });

  it('compare une période en cours à date égale, le jour coupé au prorata', () => {
    // Le 11 octobre à midi : dix jours et demi écoulés.
    const now = new Date('2026-10-11T12:00').getTime();
    const october = constant('2026-10-01', 31, 10, 11);
    october[10].peak = 8;
    const september = constant('2026-09-01', 30, 10);

    expect(getChange(october, september, now)).toBeCloseTo(108 / 105 - 1);
  });

  it('ne compare pas sans consommation de référence', () => {
    const now = new Date('2026-10-11T12:00').getTime();
    const october = constant('2026-10-01', 31, 10, 11);

    expect(
      getChange(october, constant('2026-09-01', 30, null), now),
    ).toBeNull();
    expect(getChange(october, constant('2026-09-01', 30, 0), now)).toBeNull();
  });

  it('ignore les jours sans statistique', () => {
    const october = constant('2026-10-01', 31, 10);
    const september = constant('2026-09-01', 30, 10, 15);

    expect(
      getChange(october, september, new Date('2026-11-05').getTime()),
    ).toBeCloseTo(310 / 150 - 1);
  });
});

describe('coûts', () => {
  const prices = {peak: 0.25, offPeak: 0.2};

  it('additionne les heures pleines et creuses à leur tarif', () => {
    expect(getCost({peak: 4, offPeak: 5}, prices)).toBe(2);
  });

  it('ne donne pas de coût partiel', () => {
    expect(getCost({peak: 4, offPeak: null}, prices)).toBeNull();
  });

  it('additionne les jours connus d’une période', () => {
    const total = sumConsumption([
      {start: 0, end: 1, peak: 4, offPeak: 5},
      {start: 1, end: 2, peak: null, offPeak: null},
      {start: 2, end: 3, peak: 2, offPeak: 1},
    ]);

    expect(total).toEqual({peak: 6, offPeak: 6});
    expect(getTotal(total)).toBe(12);
    expect(getCost(total, prices)).toBe(2.7);
    expect(
      sumConsumption([{start: 0, end: 1, peak: null, offPeak: null}]),
    ).toEqual({peak: null, offPeak: null});
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

  it('écrit l’énergie au dixième de kWh, au kWh au-delà de 100, et le coût au centime', () => {
    expect(formatEnergy(3.44)).toBe('3,4 kWh');
    expect(formatEnergy(0)).toBe('0 kWh');
    expect(formatEnergy(1234.5)).toMatch(/^1\s235 kWh$/);
    expect(formatCost(1.234)).toMatch(/^1,23\s€$/);
  });

  it('écrit l’écart signé, au pour cent', () => {
    expect(formatChange(-0.123)).toMatch(/^−12\s%$/);
    expect(formatChange(0.054)).toMatch(/^\+5\s%$/);
    expect(formatChange(0.001)).toMatch(/^0\s%$/);
  });

  it('nomme la semaine, le mois ou l’année', () => {
    const now = new Date('2026-10-24T15:00');
    expect(formatPeriod('week', getPeriod('week', now))).toBe(
      'semaine du 19 oct. 2026',
    );
    expect(formatPeriod('month', getPeriod('month', now))).toBe('octobre 2026');
    expect(formatPeriod('year', getPeriod('year', now))).toBe('2026');
  });

  it('affiche un tiret sans valeur', () => {
    expect(formatPower(null, 'VA')).toBe('—');
    expect(formatEnergy(null)).toBe('—');
    expect(formatCost(null)).toBe('—');
  });
});
