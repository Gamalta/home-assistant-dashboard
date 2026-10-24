import type {HassEntities} from 'home-assistant-js-websocket';
import {createSensor} from './createSensor';

// Compteur fictif en heures pleines / heures creuses, creuses de 22 h à 6 h.
const POWER = 'sensor.meter_apparent_power';
const TARIFF_PERIOD = 'sensor.meter_tariff_period';
const PEAK_INDEX = 'sensor.meter_peak_index';
const OFF_PEAK_INDEX = 'sensor.meter_off_peak_index';

const isOffPeak = (date: Date) => date.getHours() >= 22 || date.getHours() < 6;
const ptec = (date: Date) => (isOffPeak(date) ? 'HC..' : 'HP..');

const now = new Date();
const today = new Date(now);
today.setHours(0, 0, 0, 0);

// 30 jours de statistiques quotidiennes, variées mais identiques d'un lancement à l'autre.
function dailyStatistics(firstIndex: number, change: (day: number) => number) {
  let state = firstIndex;
  return Array.from({length: 30}, (_, day) => {
    const start = new Date(today);
    start.setDate(start.getDate() + day - 30);
    const consumption = change(day);
    state += consumption;
    return {start: start.getTime(), change: consumption, state};
  });
}

const peakStatistics = dailyStatistics(12_000, day => 6 + 2 * Math.sin(day));
const offPeakStatistics = dailyStatistics(8_000, day => 3.5 + Math.cos(day));
const statistics: Partial<Record<string, typeof peakStatistics>> = {
  [PEAK_INDEX]: peakStatistics,
  [OFF_PEAK_INDEX]: offPeakStatistics,
};

// Index de fin d'hier, plus 0,4 kWh par heure pleine et 0,3 kWh par heure creuse écoulées.
function currentIndex(
  rows: typeof peakStatistics,
  kWhPerHour: number,
  hours: number,
) {
  return (rows[rows.length - 1].state + kWhPerHour * hours).toFixed(3);
}
const hours = (now.getTime() - today.getTime()) / 3_600_000;
const offPeakHours = Math.min(hours, 6) + Math.max(hours - 22, 0);

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
    state: currentIndex(peakStatistics, 0.4, hours - offPeakHours),
    attributes: {friendly_name: 'Index heures pleines', ...indexAttributes},
  }),
  ...createSensor(OFF_PEAK_INDEX, {
    state: currentIndex(offPeakStatistics, 0.3, offPeakHours),
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
export function getMockStatistics(statisticIds: string[], startTime: string) {
  const start = new Date(startTime).getTime();
  return Object.fromEntries(
    statisticIds.map(id => [
      id,
      (statistics[id] ?? []).filter(row => row.start >= start),
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
