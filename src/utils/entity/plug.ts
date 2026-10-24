const DEFAULT_STANDBY_THRESHOLD = 5;

// Puissance en W, ou null quand le capteur ne la connaît pas (`unavailable`, `unknown`).
export function parsePower(state?: string) {
  const power = Number.parseFloat(state ?? '');
  return Number.isFinite(power) ? power : null;
}

export function formatPower(power: number) {
  const digits = Math.abs(power) < 10 ? 1 : 0;
  return `${power.toLocaleString('fr', {maximumFractionDigits: digits})}\u00a0W`;
}

export function plugStateLabel(
  on: boolean,
  power: number | null,
  standbyThreshold = DEFAULT_STANDBY_THRESHOLD,
) {
  if (!on) return 'Éteinte';
  return power !== null && power < standbyThreshold ? 'En veille' : 'Allumée';
}
