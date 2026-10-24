// Entités créées par l'intégration ha-bambulab, nommées `<domaine>.<préfixe>_<clé>`.
export function printer3dEntityIds(prefix: string) {
  return {
    chamberLight: `light.${prefix}_chamber_light`,
    progress: `sensor.${prefix}_print_progress`,
    status: `sensor.${prefix}_print_status`,
    stage: `sensor.${prefix}_current_stage`,
    remainingTime: `sensor.${prefix}_remaining_time`,
    endTime: `sensor.${prefix}_end_time`,
    currentLayer: `sensor.${prefix}_current_layer`,
    totalLayers: `sensor.${prefix}_total_layer_count`,
    taskName: `sensor.${prefix}_task_name`,
    nozzleTemperature: `sensor.${prefix}_nozzle_temperature`,
    nozzleTargetTemperature: `sensor.${prefix}_nozzle_target_temperature`,
    bedTemperature: `sensor.${prefix}_bed_temperature`,
    bedTargetTemperature: `sensor.${prefix}_bed_target_temperature`,
    wifiSignal: `sensor.${prefix}_wi_fi_signal`,
    externalSpool: `sensor.${prefix}_externalspool_external_spool`,
    printingSpeed: `select.${prefix}_printing_speed`,
    pause: `button.${prefix}_pause`,
    resume: `button.${prefix}_resume`,
    stop: `button.${prefix}_stop`,
    coverImage: `image.${prefix}_cover_image`,
    online: `binary_sensor.${prefix}_online`,
    hmsErrors: `binary_sensor.${prefix}_hms_errors`,
    printError: `binary_sensor.${prefix}_print_error`,
  } as const;
}

export type Printer3dEntityIds = ReturnType<typeof printer3dEntityIds>;

// États de `print_status` (GCODE_STATE_OPTIONS de ha-bambulab). Un arrêt
// demandé par l'utilisateur remonte aussi en `failed`.
const STATUS_LABELS: Record<string, string> = {
  failed: 'Interrompue',
  finish: 'Terminée',
  idle: 'Inactive',
  init: 'Initialisation',
  offline: 'Hors ligne',
  pause: 'En pause',
  prepare: 'Préparation',
  running: 'En cours',
  slicing: 'Tranchage',
  unknown: 'Inconnu',
};

// Étapes de `current_stage` qu'une P1S peut remonter (CURRENT_STAGE_IDS 0 à 35).
// Celles d'une pause se lisent à côté de l'état « En pause ».
const STAGE_LABELS: Record<string, string> = {
  printing: 'Impression',
  auto_bed_leveling: 'Nivellement du plateau',
  heatbed_preheating: 'Préchauffage du plateau',
  sweeping_xy_mech_mode: 'Compensation des vibrations',
  changing_filament: 'Changement de filament',
  m400_pause: 'Commande M400',
  paused_filament_runout: 'Fin du filament',
  heating_hotend: 'Chauffe de la buse',
  calibrating_extrusion: "Calibration de l'extrusion",
  scanning_bed_surface: 'Analyse de la surface du plateau',
  inspecting_first_layer: 'Inspection de la première couche',
  identifying_build_plate_type: 'Identification du plateau',
  calibrating_micro_lidar: 'Calibration du lidar',
  homing_toolhead: "Mise à l'origine de la tête",
  cleaning_nozzle_tip: 'Nettoyage de la buse',
  checking_extruder_temperature: "Contrôle de la température de l'extrudeur",
  paused_user: "Demandée par l'utilisateur",
  paused_front_cover_falling: 'Capot avant tombé',
  calibrating_extrusion_flow: 'Calibration du débit',
  paused_nozzle_temperature_malfunction: 'Température de la buse anormale',
  paused_heat_bed_temperature_malfunction: 'Température du plateau anormale',
  filament_unloading: 'Déchargement du filament',
  paused_skipped_step: 'Perte de pas',
  filament_loading: 'Chargement du filament',
  calibrating_motor_noise: 'Calibration du bruit des moteurs',
  paused_ams_lost: 'AMS perdu',
  paused_low_fan_speed_heat_break: 'Ventilateur du heatbreak trop lent',
  paused_chamber_temperature_control_error:
    'Température de la chambre anormale',
  cooling_chamber: 'Refroidissement de la chambre',
  paused_user_gcode: 'Demandée par le G-code',
  motor_noise_showoff: 'Démonstration du bruit des moteurs',
  paused_nozzle_filament_covered_detected: 'Buse enrobée de filament',
  paused_cutter_error: 'Erreur du coupe-filament',
  paused_first_layer_error: 'Défaut de première couche',
  paused_nozzle_clog: 'Buse bouchée',
};

const SPEED_LABELS: Record<string, string> = {
  silent: 'Silencieux',
  standard: 'Standard',
  sport: 'Sport',
  ludicrous: 'Insensé',
};

export function printStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

export function currentStageLabel(stage: string) {
  return STAGE_LABELS[stage] ?? stage;
}

export function printSpeedLabel(speed: string) {
  return SPEED_LABELS[speed] ?? speed;
}

// Une impression est en cours, en pause comprise.
export function isPrintActive(status?: string) {
  return status === 'prepare' || status === 'running' || status === 'pause';
}

export function formatTemperatures(current?: string, target?: string) {
  const format = (state?: string) => {
    const value = Math.round(Number(state));
    return Number.isNaN(value) ? '--' : value;
  };
  return `${format(current)} / ${format(target)} °C`;
}

// `remaining_time` est en heures décimales, l'unité par défaut de ha-bambulab.
export function formatRemainingTime(state?: string) {
  const minutes = Math.round(Number(state) * 60);
  if (!state || !Number.isFinite(minutes)) return null;
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
}

export function formatEndTime(state?: string, now = new Date()) {
  const end = new Date(state ?? '');
  if (Number.isNaN(end.getTime())) return null;

  const time = end.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  if (end.toDateString() === now.toDateString()) return `Fin vers ${time}`;
  if (end.toDateString() === tomorrow.toDateString())
    return `Fin demain vers ${time}`;
  const date = end.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  });
  return `Fin le ${date} vers ${time}`;
}
