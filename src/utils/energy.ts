export type TariffPeriod = 'peak' | 'offPeak';

export const TARIFF_PERIODS = {
  peak: {label: 'Heures pleines', short: 'HP', color: '#d95926'},
  offPeak: {label: 'Heures creuses', short: 'HC', color: '#2a78d6'},
} as const;

/** Échelle de l'historique : une barre par jour en semaine et en mois, par mois en année. */
export type Scale = 'week' | 'month' | 'year';

/** Pas des statistiques de Home Assistant demandées pour chaque échelle. */
export type StatisticsPeriod = 'day' | 'month';

export const STATISTICS_PERIOD: Record<Scale, StatisticsPeriod> = {
  week: 'day',
  month: 'day',
  year: 'month',
};

/** Période précédente, ou même période un an avant. */
export type Comparison = 'previous' | 'lastYear';

/** Intervalle [start, end[, en millisecondes. */
export type Period = {start: number; end: number};

/** Ligne de `recorder/statistics_during_period`, en kWh. */
export type EnergyStatistic = {
  start: number;
  change?: number | null;
  state?: number | null;
};

export type Consumption = Period & Record<TariffPeriod, number | null>;

const KWH_PER_UNIT: Partial<Record<string, number>> = {
  Wh: 0.001,
  kWh: 1,
  MWh: 1000,
};

/** Valeur numérique d'un état, `null` s'il est indisponible. */
export function parseState(state: string | undefined) {
  const value = Number.parseFloat(state ?? '');
  return Number.isFinite(value) ? value : null;
}

/** Index en kWh, que l'entité soit en Wh, en kWh ou en MWh. */
export function toKWh(state: string | undefined, unit: string | undefined) {
  const value = parseState(state);
  const factor = unit ? KWH_PER_UNIT[unit] : undefined;
  return value === null || factor === undefined ? null : value * factor;
}

/** Période tarifaire d'après la PTEC (« HC.. », « HPJB ») ou le libellé du mode standard (« HEURES CREUSES »). */
export function getTariffPeriod(
  state: string | undefined,
): TariffPeriod | null {
  if (!state) return null;
  if (/^HC|CREUSE/i.test(state)) return 'offPeak';
  if (/^HP|PLEINE/i.test(state)) return 'peak';
  return null;
}

/** Minuit, heure locale, `offset` jours après celui de `now`. */
export function dayStart(now: Date, offset = 0) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  // setDate plutôt que 24 h : les jours de changement d'heure durent 23 ou 25 h.
  date.setDate(date.getDate() + offset);
  return date.getTime();
}

/** `time` décalé de `count` jours ou mois, en heure locale : un jour de changement d'heure dure 23 ou 25 h. */
export function shift(time: number, unit: StatisticsPeriod, count: number) {
  const date = new Date(time);
  if (unit === 'day') date.setDate(date.getDate() + count);
  else date.setMonth(date.getMonth() + count);
  return date.getTime();
}

function periodStart(scale: Scale, now: Date, offset: number) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  if (scale === 'week') {
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 7 * offset);
  } else if (scale === 'month') {
    // Le 1er d'abord : un 31 octobre moins un mois ne doit pas tomber le 1er octobre.
    date.setFullYear(date.getFullYear(), date.getMonth() + offset, 1);
  } else {
    date.setFullYear(date.getFullYear() + offset, 0, 1);
  }
  return date.getTime();
}

/** Semaine (du lundi), mois ou année qui contient `now`, décalé de `offset` périodes. */
export function getPeriod(scale: Scale, now: Date, offset = 0): Period {
  return {
    start: periodStart(scale, now, offset),
    end: periodStart(scale, now, offset + 1),
  };
}

/** Période comparée : la précédente, ou la même un an avant ; en semaine, 52 semaines avant pour garder les mêmes jours. */
export function getComparisonPeriod(
  scale: Scale,
  period: Period,
  comparison: Comparison,
) {
  const start = new Date(period.start);
  if (comparison === 'previous') return getPeriod(scale, start, -1);
  if (scale === 'week') start.setDate(start.getDate() - 364);
  else start.setFullYear(start.getFullYear() - 1);
  return getPeriod(scale, start);
}

/** Jours ou mois d'une période, alignés d'une période à l'autre par leur rang : le 1er avec le 1er. */
export function getBuckets(period: Period, unit: StatisticsPeriod) {
  const buckets: Period[] = [];
  for (let start = period.start; start < period.end; ) {
    const end = shift(start, unit, 1);
    buckets.push({start, end});
    start = end;
  }
  return buckets;
}

const findRow = (rows: EnergyStatistic[], start: number, end: number) =>
  rows.find(row => row.start >= start && row.start < end);

function getBucketConsumption(
  rows: EnergyStatistic[],
  index: number | null,
  bucket: Period,
  unit: StatisticsPeriod,
  now: number,
) {
  if (now >= bucket.end) {
    return findRow(rows, bucket.start, bucket.end)?.change ?? null;
  }
  if (now < bucket.start) return null;
  // La statistique en cours n'est compilée qu'à chaque heure : l'index courant est plus frais.
  const lastIndex = findRow(
    rows,
    shift(bucket.start, unit, -1),
    bucket.start,
  )?.state;
  if (index === null || lastIndex == null) return null;
  // Comme Home Assistant : une baisse de plus de 10 % est un compteur remis à zéro ou remplacé, une plus faible un arrondi.
  if (index < lastIndex * 0.9) return null;
  return Math.max(index - lastIndex, 0);
}

/**
 * Consommation en kWh de chaque jour ou mois, `null` s'il est à venir ou sans statistique.
 * Un intervalle écoulé vient de sa statistique ; celui en cours, de l'index courant moins l'index de fin du précédent.
 */
export function getConsumption(
  statistics: Record<TariffPeriod, EnergyStatistic[]>,
  indexes: Record<TariffPeriod, number | null>,
  buckets: Period[],
  unit: StatisticsPeriod,
  now: number,
): Consumption[] {
  return buckets.map(bucket => ({
    ...bucket,
    peak: getBucketConsumption(
      statistics.peak,
      indexes.peak,
      bucket,
      unit,
      now,
    ),
    offPeak: getBucketConsumption(
      statistics.offPeak,
      indexes.offPeak,
      bucket,
      unit,
      now,
    ),
  }));
}

/** Consommation totale, `null` s'il manque les heures pleines ou les heures creuses. */
export function getTotal(consumption: Record<TariffPeriod, number | null>) {
  const {peak, offPeak} = consumption;
  return peak === null || offPeak === null ? null : peak + offPeak;
}

const sum = (values: (number | null)[]) =>
  values.reduce<number | null>(
    (total, value) => (value === null ? total : (total ?? 0) + value),
    null,
  );

/** Consommation d'une période : la somme des intervalles connus, `null` sans aucun. */
export function sumConsumption(
  buckets: Consumption[],
): Record<TariffPeriod, number | null> {
  return {
    peak: sum(buckets.map(bucket => bucket.peak)),
    offPeak: sum(buckets.map(bucket => bucket.offPeak)),
  };
}

/** Coût estimé en euros, hors abonnement. */
export function getCost(
  consumption: Record<TariffPeriod, number | null>,
  prices: Record<TariffPeriod, number>,
) {
  const {peak, offPeak} = consumption;
  if (peak === null || offPeak === null) return null;
  return peak * prices.peak + offPeak * prices.offPeak;
}

/**
 * Écart relatif avec la période comparée, `null` sans base de comparaison.
 * Pour une période en cours, la comparaison s'arrête au même temps écoulé, et son intervalle coupé compte au prorata.
 */
export function getChange(
  current: Consumption[],
  reference: Consumption[],
  now: number,
) {
  const start = current[0].start;
  const ongoing = now < current[current.length - 1].end;
  const cut = ongoing ? reference[0].start + now - start : Infinity;
  const total = getTotal(sumConsumption(current));
  const referenceTotal = sum(
    reference.map(bucket => {
      const share = (cut - bucket.start) / (bucket.end - bucket.start);
      const value = getTotal(bucket);
      return share <= 0 || value === null ? null : value * Math.min(share, 1);
    }),
  );
  if (total === null || !referenceTotal) return null;
  return total / referenceTotal - 1;
}

/** Puissance souscrite en VA : Enedis compte 200 V par ampère souscrit (30 A pour 6 kVA). */
export function getSubscribedPower(subscribedCurrent: number | null) {
  return subscribedCurrent ? subscribedCurrent * 200 : null;
}

const formatNumber = (value: number) =>
  value.toLocaleString('fr-FR', {maximumFractionDigits: 1});

/** « 450 VA », « 1,2 kVA » ; « — » sans valeur. */
export function formatPower(value: number | null, unit: string) {
  if (value === null) return '—';
  return value >= 1000
    ? `${formatNumber(value / 1000)} k${unit}`
    : `${formatNumber(value)} ${unit}`;
}

/** « 3,4 kWh », « 251 kWh » ; « — » sans valeur. */
export function formatEnergy(kWh: number | null) {
  if (kWh === null) return '—';
  // Au-delà de 100 kWh, la décimale n'apporte rien et allonge le total d'une année.
  return `${kWh >= 100 ? Math.round(kWh).toLocaleString('fr-FR') : formatNumber(kWh)} kWh`;
}

/** « −12 % », « +5 % ». */
export function formatChange(change: number) {
  return change
    .toLocaleString('fr-FR', {
      style: 'percent',
      maximumFractionDigits: 0,
      signDisplay: 'exceptZero',
    })
    .replace('-', '−');
}

/** « semaine du 19 oct. 2026 », « octobre 2026 » ou « 2026 ». */
export function formatPeriod(scale: Scale, period: Period) {
  const date = new Date(period.start);
  if (scale === 'year') return String(date.getFullYear());
  if (scale === 'month') {
    return date.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'});
  }
  return `semaine du ${date.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short', year: 'numeric'})}`;
}

/** « 0,2516 €/kWh » : les tarifs ont jusqu'à quatre décimales. */
export function formatPrice(euros: number) {
  return `${euros.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 4})} €/kWh`;
}

/** « 1,23 € » ; « — » sans valeur. */
export function formatCost(euros: number | null) {
  return euros === null
    ? '—'
    : euros.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'});
}
