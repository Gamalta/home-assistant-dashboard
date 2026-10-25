// Position en % : 0 fermé, 100 ouvert.
export function shutterStateLabel(state?: string, position?: number) {
  if (state === 'unavailable') return 'Indisponible';
  if (state === 'opening') return 'Ouverture…';
  if (state === 'closing') return 'Fermeture…';
  if (state === 'closed' || position === 0) return 'Fermé';
  if (position === undefined || position === 100) return 'Ouvert';
  return `Ouvert à ${position} %`;
}
