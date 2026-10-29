import {describe, expect, it} from 'vitest';
import {
  formatReport,
  mostFrequent,
  percentile,
  toRow,
  type BenchRun,
} from './report.ts';

const measures = {
  startupPrograms: 20,
  drawsPerFrame: [0, 92, 46, 46, 138, 46, 0],
  cpuMs: 0.34,
  gpuMs: 4.06,
  rotationPrograms: 0,
  longTasks: [],
  frameIntervals: [16.7, 16.6, 16.7, 33.4, 16.7],
};

const run = (rows = [toRow('demo', 'defaut', measures)]): BenchRun => ({
  date: '2026-10-24T00:00:00.000Z',
  build: 'abc1234',
  browser: 'Chrome 141 · Apple M4',
  viewport: '1280×800 @2',
  cpuSlowdown: 1,
  rows,
});

describe('percentile', () => {
  it('prend la valeur au rang le plus proche', () => {
    const values = [5, 1, 4, 2, 3];
    expect(percentile(values, 50)).toBe(3);
    expect(percentile(values, 95)).toBe(5);
    expect(percentile(values, 0)).toBe(1);
  });

  it('vaut 0 sans valeur', () => {
    expect(percentile([], 95)).toBe(0);
  });
});

describe('mostFrequent', () => {
  it('ignore les images sans rendu et les images à plusieurs rendus', () => {
    expect(mostFrequent([0, 0, 92, 46, 46, 138, 46, 92])).toBe(46);
  });

  it('garde la plus petite valeur en cas d’égalité', () => {
    expect(mostFrequent([92, 46])).toBe(46);
  });
});

describe('toRow', () => {
  it('agrège les mesures brutes d’un scénario', () => {
    expect(
      toRow('demo', 'ombres', {
        ...measures,
        rotationPrograms: 10,
        longTasks: [71.4, 219.06],
      }),
    ).toEqual({
      house: 'demo',
      options: 'ombres',
      drawCalls: 46,
      startupPrograms: 20,
      rotationPrograms: 10,
      longTasks: 2,
      longestTaskMs: 219.1,
      cpuMs: 0.3,
      gpuMs: 4.1,
      frameP50Ms: 16.7,
      frameP95Ms: 33.4,
    });
  });

  it('compte zéro tâche longue quand il n’y en a pas', () => {
    const row = toRow('demo', 'defaut', measures);
    expect(row.longTasks).toBe(0);
    expect(row.longestTaskMs).toBe(0);
  });
});

describe('formatReport', () => {
  it('imprime un tableau Markdown avec l’environnement de mesure', () => {
    const lines = formatReport(run()).split('\n');
    expect(lines[0]).toBe(
      'Chrome 141 · Apple M4 · 1280×800 @2 · CPU ×1 · abc1234',
    );
    expect(lines[2]).toMatch(/^\| Maison \| Options \| Draw calls \|/);
    expect(lines[4]).toBe(
      '| demo | defaut | 46 | 20 | 0 | 0 | 0 | 0,3 | 4,1 | 16,7 | 33,4 |',
    );
  });

  it('met en gras les valeurs hors budget', () => {
    const row = {
      ...toRow('apartment', 'ombres', measures),
      drawCalls: 1045,
      rotationPrograms: 5,
      longTasks: 1,
      longestTaskMs: 130,
    };
    expect(formatReport(run([row]))).toContain(
      '| apartment | ombres | **1045** | 20 | **5** | **1** | **130** |',
    );
  });

  it('affiche « avant → après » pour les valeurs qui changent', () => {
    const before = run([
      {...toRow('demo', 'defaut', measures), drawCalls: 929},
    ]);
    const report = formatReport(run(), before);
    expect(report).toContain('| demo | defaut | 929 → 46 | 20 |');
    expect(report).toContain('Comparé à abc1234 (avant → après).');
    expect(report).not.toContain('Environnements différents');
  });

  it('affiche telle quelle une ligne absente de la référence', () => {
    const before = run([]);
    expect(formatReport(run(), before)).toContain(
      '| demo | defaut | 46 | 20 |',
    );
  });

  it('prévient quand les environnements de mesure diffèrent', () => {
    const before = {...run(), browser: 'Chrome 141 · SwiftShader'};
    expect(formatReport(run(), before)).toContain(
      'Environnements différents (avant : Chrome 141 · SwiftShader · 1280×800 @2 · CPU ×1) : seuls les draw calls et les programmes sont comparables.',
    );
  });
});
