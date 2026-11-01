export function climateStateLabel(state: string, target?: number) {
  if (state === 'unavailable') return 'Indisponible';
  if (state === 'off') return 'Arrêt';
  return target === undefined ? 'Marche' : `Consigne ${target}°`;
}
