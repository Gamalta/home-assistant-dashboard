export const DEFAULT_STANDBY_THRESHOLD = 5;

export type PlugStatus = 'on' | 'standby' | 'off';

// Puissance en W, ou null quand le capteur ne la connaît pas (`unavailable`, `unknown`).
export function parsePower(state?: string) {
  const power = Number.parseFloat(state ?? '');
  return Number.isFinite(power) ? power : null;
}

export function formatPower(power: number) {
  const digits = Math.abs(power) < 10 ? 1 : 0;
  return `${power.toLocaleString('fr', {maximumFractionDigits: digits})} W`;
}

export function plugStatus(
  on: boolean,
  power: number | null,
  standbyThreshold = DEFAULT_STANDBY_THRESHOLD,
): PlugStatus {
  if (!on) return 'off';
  return power !== null && power < standbyThreshold ? 'standby' : 'on';
}
