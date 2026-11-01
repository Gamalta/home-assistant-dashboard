import {useEntities} from '@hakit/core';
import {useEffect, useState} from 'react';
import {trainEntityIds, upcomingDepartures} from '../utils/trains';

/** Départs à venir du trajet sncf_trains de préfixe `prefix`. */
export function useTrainDepartures(prefix: string) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    // Un train parti disparaît sans attendre la mise à jour du capteur.
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const trains = useEntities(trainEntityIds(prefix), {
    returnNullIfNotFound: true,
    historyOptions: {disable: true},
  });
  return upcomingDepartures(trains, now);
}
