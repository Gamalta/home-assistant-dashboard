import type {HassEntity} from 'home-assistant-js-websocket';
import {describe, expect, it} from 'vitest';
import {
  departureStatus,
  formatTime,
  parseDeparture,
  trainEntityIds,
  upcomingDepartures,
} from './trains';

// Capteur tel que sncf_trains le publie : état en UTC, attributs en heure locale.
const train = (
  entityId: string,
  state: string,
  attributes: Record<string, unknown> = {},
) => ({entity_id: entityId, state, attributes}) as HassEntity;

const late = train('sensor.sncf_a_b_train_2', '2026-10-24T05:42:00+00:00', {
  departure_time: '24/10/2026 - 07:47',
  base_departure_time: '24/10/2026 - 07:42',
  arrival_time: '24/10/2026 - 08:22',
  delay_minutes: 3,
  duration_minutes: 35,
  commercial_mode: 'TER',
  train_num: '87654',
});

describe('trainEntityIds', () => {
  it('déduit les dix capteurs possibles du trajet', () => {
    const ids = trainEntityIds('sncf_a_b');
    expect(ids).toHaveLength(10);
    expect(ids[0]).toBe('sensor.sncf_a_b_train_1');
    expect(ids[9]).toBe('sensor.sncf_a_b_train_10');
  });
});

describe('parseDeparture', () => {
  it('calcule le retard au départ, pas celui de l’arrivée', () => {
    const departure = parseDeparture(late);
    expect(departure?.delay).toBe(5);
    expect(departure?.scheduled.toISOString()).toBe('2026-10-24T05:42:00.000Z');
    expect(departure?.expected.toISOString()).toBe('2026-10-24T05:47:00.000Z');
  });

  it('déduit l’arrivée réelle de la durée du trajet', () => {
    expect(parseDeparture(late)?.arrival?.toISOString()).toBe(
      '2026-10-24T06:22:00.000Z',
    );
  });

  it('nomme le train par son mode et son numéro', () => {
    expect(parseDeparture(late)?.train).toBe('TER 87654');
  });

  it('lit la voie et la suppression quand elles existent', () => {
    const departure = parseDeparture(
      train('sensor.x', '2026-10-24T05:42:00+00:00', {
        platform: 'B',
        cancelled: true,
      }),
    );
    expect(departure?.platform).toBe('B');
    expect(departure?.cancelled).toBe(true);
  });

  it('considère à l’heure un train sans attributs', () => {
    const departure = parseDeparture(
      train('sensor.x', '2026-10-24T05:42:00+00:00', {departure_time: 'N/A'}),
    );
    expect(departure).toMatchObject({delay: 0, cancelled: false});
    expect(departure?.arrival).toBeUndefined();
    expect(departure?.train).toBeUndefined();
    expect(departure?.platform).toBeUndefined();
  });

  it('ignore un capteur absent, inconnu ou indisponible', () => {
    expect(parseDeparture(null)).toBeUndefined();
    expect(parseDeparture(train('sensor.x', 'unknown'))).toBeUndefined();
    expect(parseDeparture(train('sensor.x', 'unavailable'))).toBeUndefined();
  });
});

describe('upcomingDepartures', () => {
  const at = (time: string) => train(`sensor.${time}`, time);

  it('retire les trains déjà partis et trie par heure de départ réelle', () => {
    const departures = upcomingDepartures(
      [
        at('2026-10-24T06:12:00Z'),
        late,
        null,
        at('2026-10-24T05:30:00Z'),
        at('2026-10-24T05:45:00Z'),
      ],
      Date.parse('2026-10-24T05:40:00Z'),
    );
    expect(departures.map(departure => departure.entityId)).toEqual([
      'sensor.2026-10-24T05:45:00Z',
      'sensor.sncf_a_b_train_2',
      'sensor.2026-10-24T06:12:00Z',
    ]);
  });

  it('garde un train prévu parti mais en retard', () => {
    const departures = upcomingDepartures(
      [late],
      Date.parse('2026-10-24T05:45:00Z'),
    );
    expect(departures).toHaveLength(1);
  });
});

describe('departureStatus', () => {
  const base = parseDeparture(train('sensor.x', '2026-10-24T05:42:00Z'))!;

  it('annonce un train à l’heure', () => {
    expect(departureStatus(base).label).toBe("à l'heure");
  });

  it('annonce le retard en minutes', () => {
    expect(departureStatus({...base, delay: 5})).toEqual({
      label: '+5 min',
      color: 'warning.main',
    });
  });

  it('met en évidence un train supprimé, même en retard', () => {
    expect(departureStatus({...base, delay: 5, cancelled: true})).toEqual({
      label: 'supprimé',
      color: 'error.main',
    });
  });
});

describe('formatTime', () => {
  it('affiche l’heure sur deux chiffres', () => {
    expect(formatTime(new Date(2026, 9, 24, 7, 5))).toBe('07:05');
  });
});
