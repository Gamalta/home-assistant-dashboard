// Sous ce niveau, la pile est à remplacer.
export const LOW_BATTERY_LEVEL = 20;

// Niveau en %, ou null quand l'entité ne donne pas de nombre (unknown, unavailable).
export function batteryLevel(state?: string): number | null {
  if (!state) return null;
  const level = Math.round(Number(state));
  return Number.isNaN(level) ? null : level;
}

export function isBatteryLow(level: number | null) {
  return level !== null && level < LOW_BATTERY_LEVEL;
}
