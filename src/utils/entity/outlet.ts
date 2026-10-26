// Puissance en W, ou null quand le capteur ne la connaît pas (`unavailable`, `unknown`).
export function parsePower(state?: string) {
  const power = Number.parseFloat(state ?? '');
  return Number.isFinite(power) ? power : null;
}

export function formatPower(power: number) {
  const digits = Math.abs(power) < 10 ? 1 : 0;
  return `${power.toLocaleString('fr', {maximumFractionDigits: digits})} W`;
}
