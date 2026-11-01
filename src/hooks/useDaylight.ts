import {useEffect, useState} from 'react';
import {useEntity} from '@hakit/core';
import {useAppContext} from '../contexts/AppContext';
import {daylightFactor, sunAtHour, sunFromHour} from '../rendering/daylight';

const daylightNow = () => daylightFactor(sunFromHour(new Date()).elevation);

/** Part du jour, de 0 à 1, selon l'heure simulée, `sun.sun` ou l'heure. */
export function useDaylight() {
  const sunEntity = useEntity('sun.sun', {returnNullIfNotFound: true});
  const {simulatedHour} = useAppContext();
  const [hourDaylight, setHourDaylight] = useState(daylightNow);

  useEffect(() => {
    // La part du jour ne bouge qu'à l'aube et au crépuscule : le reste du
    // temps, React ignore la mise à jour et la scène ne redessine rien.
    const interval = setInterval(() => setHourDaylight(daylightNow()), 60000);
    return () => clearInterval(interval);
  }, []);

  const elevation = Number(sunEntity?.attributes.elevation);
  if (simulatedHour !== null)
    return daylightFactor(sunAtHour(simulatedHour).elevation);
  return isNaN(elevation) ? hourDaylight : daylightFactor(elevation);
}
