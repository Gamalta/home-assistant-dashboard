import {useEffect, useState} from 'react';
import {useAppContext} from '../contexts/AppContext';
import {isHolidaySeason} from '../utils/holidays';

/** Mode fêtes actif : forcé dans les réglages, ou en automatique pendant les fêtes. */
export function useHolidayMode() {
  const {configuration} = useAppContext();
  const [season, setSeason] = useState(() => isHolidaySeason(new Date()));

  useEffect(() => {
    // La tablette murale reste allumée des semaines sans recharger la page.
    const interval = setInterval(
      () => setSeason(isHolidaySeason(new Date())),
      3600_000,
    );
    return () => clearInterval(interval);
  }, []);

  if (configuration.holidayMode === 'auto') return season;
  return configuration.holidayMode === 'on';
}
