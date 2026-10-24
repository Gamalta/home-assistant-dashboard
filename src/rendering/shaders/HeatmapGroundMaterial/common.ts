export type HeatmapPoint = {
  x: number;
  z: number;
  temperature: number;
};

/** Nombre maximum de capteurs pris en compte par les shaders. */
export const MAX_HEATMAP_POINTS = 32;

/** Écart minimal (en °C) entre les bornes de l'échelle de couleurs. */
const MIN_TEMPERATURE_SPREAD = 1;

export function limitHeatmapPoints(points: HeatmapPoint[]) {
  if (points.length > MAX_HEATMAP_POINTS) {
    console.warn(
      `Heatmap: ${points.length} capteurs, seuls les ${MAX_HEATMAP_POINTS} premiers sont affichés.`,
    );
  }
  return points.slice(0, MAX_HEATMAP_POINTS);
}

/**
 * Bornes de l'échelle de couleurs. On garantit un écart minimal pour éviter
 * une division par zéro dans le shader (un seul capteur, ou températures égales).
 */
export function getTemperatureRange(points: HeatmapPoint[]) {
  if (!points.length) return {minTemp: 0, maxTemp: MIN_TEMPERATURE_SPREAD};
  const temperatures = points.map(point => point.temperature);
  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);
  if (maxTemp - minTemp >= MIN_TEMPERATURE_SPREAD) return {minTemp, maxTemp};
  const middle = (minTemp + maxTemp) / 2;
  return {
    minTemp: middle - MIN_TEMPERATURE_SPREAD / 2,
    maxTemp: middle + MIN_TEMPERATURE_SPREAD / 2,
  };
}
