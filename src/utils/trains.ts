import type {HassEntity} from 'home-assistant-js-websocket';

// sncf_trains ne demande que 10 trajets à l'API, donc crée au plus 10 capteurs.
const MAX_TRAINS = 10;
const MINUTE = 60_000;

export type TrainDeparture = {
  entityId: string;
  scheduled: Date;
  /** Heure de départ réelle ou estimée. */
  expected: Date;
  /** Retard au départ, en minutes. */
  delay: number;
  arrival?: Date;
  train?: string;
  platform?: string;
  cancelled: boolean;
};

export function trainEntityIds(prefix: string) {
  return Array.from(
    {length: MAX_TRAINS},
    (_, index) => `sensor.${prefix}_train_${index + 1}` as const,
  );
}

// Les attributs d'heure valent « 24/10/2026 - 07:42 », dans le fuseau de
// Home Assistant : on n'en tire que des écarts, justes quel que soit le fuseau.
function parseTime(value: unknown) {
  const match =
    typeof value === 'string' &&
    value.match(/^(\d{2})\/(\d{2})\/(\d{4}) - (\d{2}):(\d{2})$/);
  if (!match) return undefined;
  const [, day, month, year, hours, minutes] = match.map(Number);
  return Date.UTC(year, month - 1, day, hours, minutes);
}

export function parseDeparture(
  entity: HassEntity | null,
): TrainDeparture | undefined {
  if (!entity) return undefined;
  // L'état est le départ prévu ; « unknown » quand le trajet n'existe plus.
  const scheduled = new Date(entity.state);
  if (isNaN(scheduled.getTime())) return undefined;

  const {attributes} = entity;
  const departure = parseTime(attributes.departure_time);
  const baseDeparture = parseTime(attributes.base_departure_time);
  // delay_minutes est le retard à l'arrivée : celui du départ se recalcule.
  const delay =
    departure && baseDeparture ? (departure - baseDeparture) / MINUTE : 0;
  const expected = new Date(scheduled.getTime() + delay * MINUTE);
  const duration = Number(attributes.duration_minutes);
  const train = [attributes.commercial_mode, attributes.train_num]
    .filter(Boolean)
    .join(' ');

  return {
    entityId: entity.entity_id,
    scheduled,
    expected,
    delay,
    arrival:
      duration > 0
        ? new Date(expected.getTime() + duration * MINUTE)
        : undefined,
    train: train || undefined,
    // sncf_trains 1.3.3 ne publie ni voie ni suppression (ADR 0027).
    platform: attributes.platform || undefined,
    cancelled: attributes.cancelled === true,
  };
}

/** Départs pas encore partis, du plus proche au plus lointain. */
export function upcomingDepartures(
  entities: (HassEntity | null)[],
  now: number,
) {
  return entities
    .map(parseDeparture)
    .filter(
      (departure): departure is TrainDeparture =>
        !!departure && departure.expected.getTime() >= now,
    )
    .sort((a, b) => a.expected.getTime() - b.expected.getTime());
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
}

export function departureStatus(departure: TrainDeparture) {
  if (departure.cancelled) return {label: 'supprimé', color: 'error.main'};
  if (departure.delay > 0)
    return {label: `+${departure.delay} min`, color: 'warning.main'};
  return {label: "à l'heure", color: 'text.secondary'};
}
