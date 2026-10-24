import {useHass} from '@hakit/core';
import {useEffect, useState} from 'react';
import {
  dayStart,
  type EnergyStatistic,
  type TariffPeriod,
} from '../utils/energy';

type StatisticsResponse = Partial<Record<string, EnergyStatistic[]>>;

/**
 * Statistiques quotidiennes des deux index, en kWh, sur les `days` derniers jours, chargées au montage.
 * Statistiques à long terme plutôt qu'historique : le recorder purge l'historique au bout de 10 jours par défaut.
 */
export function useEnergyStatistics(
  peakIndexEntityId: string,
  offPeakIndexEntityId: string,
  days: number,
): Record<TariffPeriod, EnergyStatistic[]> {
  const connection = useHass(state => state.connection);
  const [statistics, setStatistics] = useState<StatisticsResponse>({});

  useEffect(() => {
    if (!connection) return;
    let active = true;
    connection
      .sendMessagePromise<StatisticsResponse>({
        type: 'recorder/statistics_during_period',
        start_time: new Date(dayStart(new Date(), 1 - days)).toISOString(),
        statistic_ids: [peakIndexEntityId, offPeakIndexEntityId],
        period: 'day',
        types: ['change', 'state'],
        units: {energy: 'kWh'},
      })
      .then(response => {
        if (active) setStatistics(response);
      })
      .catch(error =>
        console.error('Statistiques d’énergie indisponibles', error),
      );
    return () => {
      active = false;
    };
  }, [connection, peakIndexEntityId, offPeakIndexEntityId, days]);

  return {
    peak: statistics[peakIndexEntityId] ?? [],
    offPeak: statistics[offPeakIndexEntityId] ?? [],
  };
}
