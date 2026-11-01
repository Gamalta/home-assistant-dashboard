import type {MapAlignmentType} from '../../configs/house';

// Entités créées par l'intégration dreame-vacuum, nommées `<domaine>.<préfixe>_<clé>`,
// où le préfixe est le nom de l'appareil.
export function vacuumEntityIds(prefix: string) {
  return {
    vacuum: `vacuum.${prefix}`,
    map: `camera.${prefix}_map`,
    cleaningMode: `select.${prefix}_cleaning_mode`,
    suctionLevel: `select.${prefix}_suction_level`,
    error: `sensor.${prefix}_error`,
  } as const;
}

export type VacuumEntityIds = ReturnType<typeof vacuumEntityIds>;

type Point = {x: number; y: number};
export type CalibrationPoint = {vacuum: Point; map: Point};

// Attribut `vacuum_state` de l'entité vacuum, plus fin que son état.
const STATE_LABELS: Record<string, string> = {
  sweeping: 'Aspiration',
  mopping: 'Lavage',
  sweeping_and_mopping: 'Aspiration et lavage',
  idle: 'Inactif',
  paused: 'En pause',
  error: 'Erreur',
  returning: 'Retour à la station',
  charging: 'En charge',
  charging_completed: 'Chargé',
  drying: 'Séchage des serpillières',
  washing: 'Lavage des serpillières',
  washing_paused: 'Lavage des serpillières en pause',
  returning_to_wash: 'Retour laver les serpillières',
  building: 'Cartographie',
  auto_emptying: 'Vidage du bac',
  returning_auto_empty: 'Retour vider le bac',
  clean_add_water: "Ajout d'eau",
  second_cleaning: 'Second passage',
  spot_cleaning: 'Nettoyage localisé',
  smart_charging: 'Charge intelligente',
  station_cleaning: 'Nettoyage de la station',
  dust_bag_drying: 'Séchage du sac',
  extra_cleaning: 'Nettoyage supplémentaire',
  waiting_for_task: 'En attente',
  entering_dock: 'Entrée dans la station',
  leaving_dock: 'Sortie de la station',
  upgrading: 'Mise à jour',
  unknown: 'Inconnu',
};

const CLEANING_MODE_LABELS: Record<string, string> = {
  sweeping: 'Aspirer',
  mopping: 'Laver',
  sweeping_and_mopping: 'Les deux',
  mopping_after_sweeping: 'Aspirer puis laver',
};

const SUCTION_LEVEL_LABELS: Record<string, string> = {
  quiet: 'Silencieuse',
  standard: 'Standard',
  strong: 'Forte',
  turbo: 'Turbo',
};

export function vacuumStateLabel(state: string) {
  return STATE_LABELS[state] ?? state;
}

export function cleaningModeLabel(mode: string) {
  return CLEANING_MODE_LABELS[mode] ?? mode;
}

export function suctionLevelLabel(level: string) {
  return SUCTION_LEVEL_LABELS[level] ?? level;
}

// Un nettoyage est en cours, en pause comprise.
export function isCleaningActive(state?: string) {
  return state === 'cleaning' || state === 'paused';
}

// `cleaning_time` est en minutes.
export function formatCleaningTime(minutes?: number) {
  if (minutes === undefined || !Number.isFinite(minutes)) return '--';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
}

// Passe des millimètres du robot aux pixels de l'image de la carte, par les
// trois points de calibration que publie l'intégration.
export function toMapPixel(point: Point, calibration: CalibrationPoint[]) {
  const [p0, p1, p2] = calibration;
  const u = {x: p1.vacuum.x - p0.vacuum.x, y: p1.vacuum.y - p0.vacuum.y};
  const v = {x: p2.vacuum.x - p0.vacuum.x, y: p2.vacuum.y - p0.vacuum.y};
  const d = {x: point.x - p0.vacuum.x, y: point.y - p0.vacuum.y};
  const det = u.x * v.y - u.y * v.x;
  const s = (d.x * v.y - d.y * v.x) / det;
  const t = (u.x * d.y - u.y * d.x) / det;
  return {
    x: p0.map.x + s * (p1.map.x - p0.map.x) + t * (p2.map.x - p0.map.x),
    y: p0.map.y + s * (p1.map.y - p0.map.y) + t * (p2.map.y - p0.map.y),
  };
}

// Celui de la démo : l'origine du robot au centre de la scène.
const DEFAULT_ALIGNMENT: MapAlignmentType = {x: 0, z: 0, rotation: 0};

// Passe d'un point du sol de la scène aux millimètres du robot : un mètre par
// unité, et l'axe y du robot vers -z.
function toVacuumPoint(x: number, z: number, alignment: MapAlignmentType) {
  const angle = (alignment.rotation * Math.PI) / 180;
  const dx = x - alignment.x;
  const dz = z - alignment.z;
  return {
    x: (dx * Math.cos(angle) - dz * Math.sin(angle)) * 1000,
    y: -(dx * Math.sin(angle) + dz * Math.cos(angle)) * 1000,
  };
}

export type FloorUv = [[number, number, number], [number, number, number]];

// Passage affine du sol (x, z) aux coordonnées de l'image, prise sans
// retournement : u = a·x + b·z + c, puis v de même.
export function floorToMapUv(
  calibration: CalibrationPoint[],
  size: {width: number; height: number},
  alignment = DEFAULT_ALIGNMENT,
): FloorUv {
  const uv = (x: number, z: number) => {
    const pixel = toMapPixel(toVacuumPoint(x, z, alignment), calibration);
    return [pixel.x / size.width, pixel.y / size.height];
  };
  const [u0, v0] = uv(0, 0);
  const [ux, vx] = uv(1, 0);
  const [uz, vz] = uv(0, 1);
  return [
    [ux - u0, uz - u0, u0],
    [vx - v0, vz - v0, v0],
  ];
}
