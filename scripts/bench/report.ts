export type BenchRow = {
  house: string;
  options: string;
  drawCalls: number;
  startupPrograms: number;
  rotationPrograms: number;
  longTasks: number;
  longestTaskMs: number;
  cpuMs: number;
  gpuMs: number;
  frameP50Ms: number;
  frameP95Ms: number;
};

export type BenchRun = {
  date: string;
  build: string;
  browser: string;
  viewport: string;
  cpuSlowdown: number;
  rows: BenchRow[];
};

export type Measures = {
  startupPrograms: number;
  drawsPerFrame: number[];
  cpuMs: number;
  gpuMs: number;
  rotationPrograms: number;
  longTasks: number[];
  frameIntervals: number[];
};

type Column = {
  key: Exclude<keyof BenchRow, 'house' | 'options'>;
  title: string;
  budget?: number;
};

// Budgets de l'ADR 0009.
const COLUMNS: Column[] = [
  {key: 'drawCalls', title: 'Draw calls', budget: 150},
  {key: 'startupPrograms', title: 'Programmes au démarrage'},
  {key: 'rotationPrograms', title: 'Programmes en rotation', budget: 0},
  {key: 'longTasks', title: 'Tâches longues', budget: 0},
  {key: 'longestTaskMs', title: 'Tâche max (ms)', budget: 50},
  {key: 'cpuMs', title: 'CPU (ms)'},
  {key: 'gpuMs', title: 'GPU (ms)'},
  {key: 'frameP50Ms', title: 'Image p50 (ms)'},
  {key: 'frameP95Ms', title: 'Image p95 (ms)'},
];

const round = (value: number) => Math.round(value * 10) / 10;
const format = (value: number) => String(value).replace('.', ',');

// Méthode du rang le plus proche : le p95 de 20 images est la 19e plus lente.
export function percentile(values: number[], p: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)] ?? 0;
}

// Le benchmark rend parfois plusieurs fois dans une même image : la valeur la
// plus fréquente est celle d'un seul rendu.
export function mostFrequent(values: number[]) {
  const counts = new Map<number, number>();
  for (const value of values) {
    if (value > 0) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  let best = 0;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount || (count === bestCount && value < best)) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

export function toRow(
  house: string,
  options: string,
  measures: Measures,
): BenchRow {
  const {drawsPerFrame, longTasks, frameIntervals} = measures;
  return {
    house,
    options,
    drawCalls: mostFrequent(drawsPerFrame),
    startupPrograms: measures.startupPrograms,
    rotationPrograms: measures.rotationPrograms,
    longTasks: longTasks.length,
    longestTaskMs: round(Math.max(0, ...longTasks)),
    cpuMs: round(measures.cpuMs),
    gpuMs: round(measures.gpuMs),
    frameP50Ms: round(percentile(frameIntervals, 50)),
    frameP95Ms: round(percentile(frameIntervals, 95)),
  };
}

function cell(column: Column, value: number, before?: number) {
  const text =
    before === undefined || before === value
      ? format(value)
      : `${format(before)} → ${format(value)}`;
  return column.budget !== undefined && value > column.budget
    ? `**${text}**`
    : text;
}

const environment = (run: BenchRun) =>
  `${run.browser} · ${run.viewport} · CPU ×${run.cpuSlowdown}`;

// Tableau Markdown, à coller dans une PR. Avec `before`, chaque valeur qui
// change s'affiche « avant → après ».
export function formatReport(run: BenchRun, before?: BenchRun) {
  const lines = [
    `${environment(run)} · ${run.build}`,
    '',
    `| Maison | Options | ${COLUMNS.map(column => column.title).join(' | ')} |`,
    `| --- | --- |${' --: |'.repeat(COLUMNS.length)}`,
  ];
  for (const row of run.rows) {
    const old = before?.rows.find(
      other => other.house === row.house && other.options === row.options,
    );
    const cells = COLUMNS.map(column =>
      cell(column, row[column.key], old?.[column.key]),
    );
    lines.push(`| ${row.house} | ${row.options} | ${cells.join(' | ')} |`);
  }
  lines.push('', 'En gras : hors du budget de l’ADR 0009.');
  if (before) {
    lines.push(`Comparé à ${before.build} (avant → après).`);
    if (environment(before) !== environment(run)) {
      lines.push(
        `Environnements différents (avant : ${environment(before)}) : seuls les draw calls et les programmes sont comparables.`,
      );
    }
  }
  return lines.join('\n');
}
