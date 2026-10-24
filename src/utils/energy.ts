export type TariffPeriod = 'peak' | 'offPeak';

export const TARIFF_PERIODS = {
  peak: {label: 'Heures pleines', short: 'HP', color: '#d95926'},
  offPeak: {label: 'Heures creuses', short: 'HC', color: '#2a78d6'},
} as const;

/** Ligne de `recorder/statistics_during_period` (période `day`), en kWh. */
export type EnergyStatistic = {
  start: number;
  change?: number | null;
  state?: number | null;
};

export type DayConsumption = {start: number} & Record<
  TariffPeriod,
  number | null
>;

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

function findDay(statistics: EnergyStatistic[], now: Date, offset: number) {
  const start = dayStart(now, offset);
  const end = dayStart(now, offset + 1);
  return statistics.find(row => row.start >= start && row.start < end);
}

function getConsumption(
  statistics: EnergyStatistic[],
  index: number | null,
  now: Date,
  offset: number,
) {
  if (offset < 0) return findDay(statistics, now, offset)?.change ?? null;
  // La statistique du jour n'est compilée qu'à chaque heure : l'index courant est plus frais.
  const lastIndex = findDay(statistics, now, -1)?.state;
  // Un index qui baisse signale un compteur remis à zéro ou remplacé.
  if (index === null || lastIndex == null || index < lastIndex) return null;
  return index - lastIndex;
}

/**
 * Consommation en kWh des `days` derniers jours, du plus ancien à aujourd'hui.
 * Un jour passé vient de sa statistique ; aujourd'hui, c'est l'index courant moins l'index de fin de la veille.
 */
export function getDailyConsumption(
  statistics: Record<TariffPeriod, EnergyStatistic[]>,
  indexes: Record<TariffPeriod, number | null>,
  days: number,
  now: Date,
): DayConsumption[] {
  return Array.from({length: days}, (_, i) => {
    const offset = i + 1 - days;
    return {
      start: dayStart(now, offset),
      peak: getConsumption(statistics.peak, indexes.peak, now, offset),
      offPeak: getConsumption(statistics.offPeak, indexes.offPeak, now, offset),
    };
  });
}

/** Coût estimé d'une journée en euros, hors abonnement. */
export function getCost(
  day: DayConsumption,
  prices: Record<TariffPeriod, number>,
) {
  if (day.peak === null || day.offPeak === null) return null;
  return day.peak * prices.peak + day.offPeak * prices.offPeak;
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

/** « 3,4 kWh » ; « — » sans valeur. */
export function formatEnergy(kWh: number | null) {
  return kWh === null ? '—' : `${formatNumber(kWh)} kWh`;
}

/** « 1,23 € » ; « — » sans valeur. */
export function formatCost(euros: number | null) {
  return euros === null
    ? '—'
    : euros.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'});
}
