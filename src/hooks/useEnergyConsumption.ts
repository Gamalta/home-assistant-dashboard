import {useEntity, useHass, type EntityName} from '@hakit/core';
import {useEffect, useState} from 'react';
import {
  type EnergyStatistic,
  getConsumption,
  type Period,
  shift,
  type StatisticsPeriod,
  toKWh,
} from '../utils/energy';

type StatisticsResponse = Partial<Record<string, EnergyStatistic[]>>;

const ENTITY_OPTIONS = {returnNullIfNotFound: true} as const;

/**
 * Consommation de chaque jour ou mois de `buckets`, `null` pendant le chargement.
 * Statistiques à long terme plutôt qu'historique : le recorder purge l'historique au bout de 10 jours par défaut.
 * La requête ne part qu'au changement de période, pas à chaque mise à jour des index.
 */
export function useEnergyConsumption(
  peakIndexEntityId: EntityName,
  offPeakIndexEntityId: EntityName,
  buckets: Period[],
  unit: StatisticsPeriod,
  now: number,
) {
  const connection = useHass(state => state.connection);
  const peakIndex = useEntity(peakIndexEntityId, ENTITY_OPTIONS);
  const offPeakIndex = useEntity(offPeakIndexEntityId, ENTITY_OPTIONS);
  const [response, setResponse] = useState<{
    key: string;
    statistics: StatisticsResponse;
  }>();

  const end = buckets[buckets.length - 1].end;
  // L'intervalle en cours part de l'index de fin du précédent.
  const start =
    end > now ? shift(buckets[0].start, unit, -1) : buckets[0].start;
  const key = [
    peakIndexEntityId,
    offPeakIndexEntityId,
    start,
    end,
    unit,
  ].join();

  useEffect(() => {
    if (!connection) return;
    let active = true;
    connection
      .sendMessagePromise<StatisticsResponse>({
        type: 'recorder/statistics_during_period',
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
        statistic_ids: [peakIndexEntityId, offPeakIndexEntityId],
        period: unit,
        types: ['change', 'state'],
        units: {energy: 'kWh'},
      })
      .catch(error => {
        console.error('Statistiques d’énergie indisponibles', error);
        return {};
      })
      .then(statistics => {
        if (active) setResponse({key, statistics});
      });
    return () => {
      active = false;
    };
  }, [connection, key]);

  if (response?.key !== key) return null;
  return getConsumption(
    {
      peak: response.statistics[peakIndexEntityId] ?? [],
      offPeak: response.statistics[offPeakIndexEntityId] ?? [],
    },
    {
      peak: toKWh(peakIndex?.state, peakIndex?.attributes.unit_of_measurement),
      offPeak: toKWh(
        offPeakIndex?.state,
        offPeakIndex?.attributes.unit_of_measurement,
      ),
    },
    buckets,
    unit,
    now,
  );
}
