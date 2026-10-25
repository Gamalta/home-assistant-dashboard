import {describe, expect, it} from 'vitest';
import {
  currentStageLabel,
  formatEndTime,
  formatRemainingTime,
  formatTemperatures,
  isPrintActive,
  printSpeedLabel,
  printStatusLabel,
  printer3dEntityIds,
} from './printer3d';

describe('printer3dEntityIds', () => {
  it('déduit les entités ha-bambulab du préfixe', () => {
    const ids = printer3dEntityIds('p1s_demo');

    expect(ids.chamberLight).toBe('light.p1s_demo_chamber_light');
    expect(ids.progress).toBe('sensor.p1s_demo_print_progress');
    expect(ids.totalLayers).toBe('sensor.p1s_demo_total_layer_count');
    expect(ids.printingSpeed).toBe('select.p1s_demo_printing_speed');
    expect(ids.stop).toBe('button.p1s_demo_stop');
    expect(ids.coverImage).toBe('image.p1s_demo_cover_image');
    expect(ids.hmsErrors).toBe('binary_sensor.p1s_demo_hms_errors');
  });
});

describe('libellés', () => {
  it('traduit l’état, l’étape et la vitesse de l’impression', () => {
    expect(printStatusLabel('running')).toBe('En cours');
    expect(printStatusLabel('failed')).toBe('Interrompue');
    expect(currentStageLabel('heatbed_preheating')).toBe(
      'Préchauffage du plateau',
    );
    expect(currentStageLabel('paused_filament_runout')).toBe('Fin du filament');
    expect(printSpeedLabel('ludicrous')).toBe('Insensé');
  });

  it('garde la valeur brute d’un état inconnu', () => {
    expect(printStatusLabel('nouvel_etat')).toBe('nouvel_etat');
    expect(currentStageLabel('heating_chamber')).toBe('heating_chamber');
  });

  it('considère la préparation et la pause comme une impression en cours', () => {
    expect(isPrintActive('prepare')).toBe(true);
    expect(isPrintActive('running')).toBe(true);
    expect(isPrintActive('pause')).toBe(true);
    expect(isPrintActive('finish')).toBe(false);
    expect(isPrintActive(undefined)).toBe(false);
  });
});

describe('formatTemperatures', () => {
  it('arrondit la température et sa cible', () => {
    expect(formatTemperatures('219.6', '220')).toBe('220 / 220 °C');
  });

  it('affiche des tirets pour une valeur indisponible', () => {
    expect(formatTemperatures('unavailable', undefined)).toBe('-- / -- °C');
  });
});

describe('formatRemainingTime', () => {
  it('convertit les heures décimales en heures et minutes', () => {
    expect(formatRemainingTime('1.25')).toBe('1 h 15');
    expect(formatRemainingTime('2.017')).toBe('2 h 01');
  });

  it('affiche les minutes sous une heure', () => {
    expect(formatRemainingTime('0.75')).toBe('45 min');
    expect(formatRemainingTime('0')).toBe('0 min');
  });

  it('ne renvoie rien sans durée connue', () => {
    expect(formatRemainingTime('unknown')).toBeNull();
    expect(formatRemainingTime(undefined)).toBeNull();
  });
});

describe('formatEndTime', () => {
  const now = new Date(2026, 9, 24, 10, 0);
  const at = (day: number, hour: number, minute: number) =>
    new Date(2026, 9, day, hour, minute).toISOString();

  it('donne l’heure de fin du jour même', () => {
    expect(formatEndTime(at(24, 14, 32), now)).toBe('Fin vers 14:32');
  });

  it('précise « demain » après minuit', () => {
    expect(formatEndTime(at(25, 8, 5), now)).toBe('Fin demain vers 08:05');
  });

  it('donne la date au-delà de demain', () => {
    expect(formatEndTime(at(26, 9, 0), now)).toBe('Fin le 26/10 vers 09:00');
  });

  it('ne renvoie rien sans heure de fin', () => {
    expect(formatEndTime('unknown', now)).toBeNull();
    expect(formatEndTime(undefined, now)).toBeNull();
  });
});
