import type {HassEntities} from 'home-assistant-js-websocket';
import {createSensor} from './createSensor';

// Compteur fictif en heures pleines / heures creuses, creuses de 22 h à 6 h.
const POWER = 'sensor.meter_apparent_power';
const TARIFF_PERIOD = 'sensor.meter_tariff_period';
const PEAK_INDEX = 'sensor.meter_peak_index';
const OFF_PEAK_INDEX = 'sensor.meter_off_peak_index';

const isOffPeak = (date: Date) => date.getHours() >= 22 || date.getHours() < 6;
const ptec = (date: Date) => (isOffPeak(date) ? 'HC..' : 'HP..');

const DAY = 86_400_000;
const now = new Date();
const today = new Date(now);
today.setHours(0, 0, 0, 0);

/**
 * Consommation d'un jour en kWh, sans hasard pour les tests : plus en hiver (chauffage) et le week-end, le chauffe-eau
 * en heures creuses la nuit, et 7 % de plus par an dans le passé, pour que l'écart avec l'an dernier soit une baisse.
 */
function dayConsumption(date: Date) {
  const day = Math.round(date.getTime() / DAY);
  // 1 à la mi-janvier, −1 à la mi-juillet.
  const winter = Math.cos((2 * Math.PI * (day - 14)) / 365.25);
  const weekend = date.getDay() === 0 || date.getDay() === 6 ? 1.5 : 0;
  const trend = 1 + (0.07 * (today.getTime() - date.getTime())) / (365 * DAY);
  return {
    peak: (6 + 3 * winter + weekend + Math.sin(day * 2.1)) * trend,
    offPeak: (4.5 + 2 * winter + 0.5 * Math.sin(day * 0.7)) * trend,
  };
}

type Row = {start: number; change: number; state: number};

// Une ligne par jour, du 1er janvier d'il y a deux ans à hier.
function dailyStatistics(firstIndex: number, tariff: 'peak' | 'offPeak') {
  const rows: Row[] = [];
  let state = firstIndex;
  const date = new Date(today.getFullYear() - 2, 0, 1);
  for (; date < today; date.setDate(date.getDate() + 1)) {
    const change = dayConsumption(date)[tariff];
    state += change;
    rows.push({start: date.getTime(), change, state});
  }
  return rows;
}

// Les mois en cumulant les jours, comme Home Assistant : la variation s'additionne, l'index est celui de fin.
function monthlyStatistics(days: Row[]) {
  const months = new Map<number, Row>();
  for (const {start, change, state} of days) {
    const date = new Date(start);
    const month = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    const row = months.get(month);
    months.set(month, {
      start: month,
      change: (row?.change ?? 0) + change,
      state,
    });
  }
  return [...months.values()];
}

const peakStatistics = dailyStatistics(12_000, 'peak');
const offPeakStatistics = dailyStatistics(8_000, 'offPeak');
const statistics: Record<'day' | 'month', Partial<Record<string, Row[]>>> = {
  day: {[PEAK_INDEX]: peakStatistics, [OFF_PEAK_INDEX]: offPeakStatistics},
  month: {
    [PEAK_INDEX]: monthlyStatistics(peakStatistics),
    [OFF_PEAK_INDEX]: monthlyStatistics(offPeakStatistics),
  },
};

// Index de fin d'hier, plus la part écoulée de la consommation du jour : 16 heures pleines, 8 heures creuses.
const hours = (now.getTime() - today.getTime()) / 3_600_000;
const offPeakHours = Math.min(hours, 6) + Math.max(hours - 22, 0);
const currentIndex = (rows: Row[], kWh: number, share: number) =>
  (rows[rows.length - 1].state + kWh * share).toFixed(3);
const consumption = dayConsumption(today);

const indexAttributes = {
  unit_of_measurement: 'kWh',
  device_class: 'energy',
  state_class: 'total_increasing',
};

export const energyEntities: HassEntities = {
  ...createSensor(POWER, {
    state: '850',
    attributes: {
      friendly_name: 'Puissance apparente',
      unit_of_measurement: 'VA',
    },
  }),
  ...createSensor(TARIFF_PERIOD, {
    state: ptec(now),
    attributes: {friendly_name: 'Période tarifaire'},
  }),
  ...createSensor(PEAK_INDEX, {
    state: currentIndex(
      peakStatistics,
      consumption.peak,
      (hours - offPeakHours) / 16,
    ),
    attributes: {friendly_name: 'Index heures pleines', ...indexAttributes},
  }),
  ...createSensor(OFF_PEAK_INDEX, {
    state: currentIndex(
      offPeakStatistics,
      consumption.offPeak,
      offPeakHours / 8,
    ),
    attributes: {friendly_name: 'Index heures creuses', ...indexAttributes},
  }),
  ...createSensor('sensor.meter_subscribed_current', {
    state: '30',
    attributes: {
      friendly_name: 'Intensité souscrite',
      unit_of_measurement: 'A',
    },
  }),
};

/** Réponse de `recorder/statistics_during_period` pour les index du compteur. */
export function getMockStatistics(
  statisticIds: string[],
  startTime: string,
  endTime: string | undefined,
  period: 'day' | 'month',
) {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Infinity;
  return Object.fromEntries(
    statisticIds.map(id => [
      id,
      (statistics[period][id] ?? []).filter(
        row => row.start >= start && row.start < end,
      ),
    ]),
  );
}

/** État du compteur `seconds` secondes plus tard : la puissance varie et l'index de la période avance. */
export function tickEnergyMeter(
  entities: HassEntities,
  seconds: number,
): HassEntities {
  const date = new Date();
  const dates = {
    last_changed: date.toISOString(),
    last_updated: date.toISOString(),
  };
  const power = Math.min(
    Math.max(Number(entities[POWER].state) + (Math.random() - 0.5) * 400, 150),
    5000,
  );
  const indexId = isOffPeak(date) ? OFF_PEAK_INDEX : PEAK_INDEX;
  const index = Number(entities[indexId].state) + (power * seconds) / 3_600_000;

  return {
    [POWER]: {...entities[POWER], ...dates, state: String(Math.round(power))},
    [TARIFF_PERIOD]: {...entities[TARIFF_PERIOD], state: ptec(date)},
    [indexId]: {...entities[indexId], ...dates, state: index.toFixed(3)},
  };
}
