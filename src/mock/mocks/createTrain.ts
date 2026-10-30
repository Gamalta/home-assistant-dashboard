import {createSensor} from './createSensor';

const MINUTE = 60_000;
// Horaires relatifs au chargement, à la minute près comme ceux de la SNCF.
const now = Math.floor(Date.now() / MINUTE) * MINUTE;

// Format des attributs de sncf_trains : « 24/10/2026 - 07:42 ».
const format = (time: number) => {
  const date = new Date(time);
  const hours = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date.toLocaleDateString('fr-FR')} - ${hours}`;
};

type TrainOptions = {
  departureIn: number;
  trainNum: string;
  delay?: number;
  platform?: string;
  cancelled?: boolean;
};

/** Capteur d'un train de l'intégration sncf_trains, d'une gare fictive à l'autre. */
export const createTrain = (entityId: string, options: TrainOptions) => {
  const {departureIn, trainNum, delay = 0, platform, cancelled} = options;
  const duration = 116;
  const departure = now + departureIn * MINUTE;
  const arrival = departure + duration * MINUTE;

  return createSensor(entityId, {
    state: new Date(departure).toISOString(),
    attributes: {
      icon: 'mdi:train',
      device_class: 'timestamp',
      departure_time: format(departure + delay * MINUTE),
      arrival_time: format(arrival + delay * MINUTE),
      base_departure_time: format(departure),
      base_arrival_time: format(arrival),
      delay_minutes: delay,
      duration_minutes: duration,
      has_delay: delay > 0,
      direction: 'Lyon Part-Dieu',
      physical_mode: 'Train grande vitesse',
      commercial_mode: 'TGV INOUI',
      train_num: trainNum,
      platform,
      cancelled,
    },
  });
};
