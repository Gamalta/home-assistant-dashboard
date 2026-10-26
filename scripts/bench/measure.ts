import type {Page} from '@playwright/test';

export type GraphicsOptions = {
  shadows?: boolean;
  heatmapShader?: boolean;
};

type Counters = {
  draws: number;
  programs: number;
  longTasks: PerformanceEntry[];
  frames?: number[];
};

declare global {
  interface Window {
    __benchCounters: Counters;
  }
}

// Exécuté dans la page avant l'application : compte les draw calls, les
// programmes liés (une compilation de shaders) et les tâches longues.
function installCounters(storage: Record<string, string>) {
  for (const [key, value] of Object.entries(storage)) {
    localStorage.setItem(key, value);
  }
  const counters: Counters = {draws: 0, programs: 0, longTasks: []};
  window.__benchCounters = counters;
  const drawCalls = [
    'drawArrays',
    'drawElements',
    'drawArraysInstanced',
    'drawElementsInstanced',
  ];
  for (const context of [WebGLRenderingContext, WebGL2RenderingContext]) {
    const methods = context.prototype as unknown as Record<
      string,
      (...args: unknown[]) => unknown
    >;
    for (const name of [...drawCalls, 'linkProgram']) {
      const original = methods[name];
      if (!original) continue;
      methods[name] = function (this: unknown, ...args: unknown[]) {
        if (name === 'linkProgram') counters.programs++;
        else counters.draws++;
        return original.apply(this, args);
      };
    }
  }
  new PerformanceObserver(list =>
    counters.longTasks.push(...list.getEntries()),
  ).observe({type: 'longtask', buffered: true});
}

// Avec frameloop="demand", une scène au repos ne dessine ni ne compile plus
// rien. Renvoie le nombre de programmes compilés depuis le chargement.
export async function waitForRest(page: Page) {
  return page.evaluate(async () => {
    const counters = window.__benchCounters;
    const deadline = performance.now() + 60_000;
    let last = -1;
    let since = performance.now();
    while (performance.now() - since < 1000) {
      if (performance.now() > deadline) {
        throw new Error('La scène ne revient pas au repos.');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      if (counters.draws + counters.programs !== last) {
        last = counters.draws + counters.programs;
        since = performance.now();
      }
    }
    return counters.programs;
  });
}

// Ouvre une maison avec des options graphiques, toujours en WebGL puisque les
// compteurs sont ceux de WebGL. Renvoie les programmes compilés au démarrage.
export async function openHouse(
  page: Page,
  house: string,
  options: GraphicsOptions = {},
) {
  await page.addInitScript(installCounters, {
    config: house,
    'graphics-options': JSON.stringify({...options, webGPU: false}),
  });
  await page.goto('/');
  await page.waitForFunction(() => !!window.__dashboardBenchmark);
  return waitForRest(page);
}

// Le benchmark intégré rend la scène au repos ; on compte les draw calls de
// chaque image affichée pendant ce temps.
export async function benchmarkAtRest(page: Page, frames = 60) {
  return page.evaluate(async frames => {
    const counters = window.__benchCounters;
    const drawsPerFrame: number[] = [];
    let last = counters.draws;
    let recording = true;
    const record = () => {
      drawsPerFrame.push(counters.draws - last);
      last = counters.draws;
      if (recording) requestAnimationFrame(record);
    };
    requestAnimationFrame(record);
    const {cpuMs, gpuMs} = await window.__dashboardBenchmark!(frames);
    recording = false;
    return {cpuMs, gpuMs, drawsPerFrame};
  }, frames);
}

// Vraie rotation à la souris (OrbitControls), jusqu'au retour au repos : la
// fin de l'inertie et de la qualité réduite fait partie du geste.
export async function rotate(page: Page, moves = 60) {
  const box = (await page.locator('canvas').boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const before = await page.evaluate(() => {
    const counters = window.__benchCounters;
    const intervals: number[] = [];
    let last = performance.now();
    const record = (now: number) => {
      intervals.push(now - last);
      last = now;
      if (counters.frames === intervals) requestAnimationFrame(record);
    };
    counters.frames = intervals;
    requestAnimationFrame(record);
    const {draws, programs} = counters;
    return {draws, programs, start: performance.now()};
  });

  // 300 px vers la droite, en accélérant puis en ralentissant, comme un doigt.
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= moves; i++) {
    await page.mouse.move(x + 150 * (1 - Math.cos((Math.PI * i) / moves)), y);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();

  const frameIntervals = await page.evaluate(() => {
    const counters = window.__benchCounters;
    const intervals = counters.frames!;
    counters.frames = undefined;
    return intervals;
  });
  const programs = (await waitForRest(page)) - before.programs;
  const {draws, longTasks} = await page.evaluate(start => {
    const counters = window.__benchCounters;
    return {
      draws: counters.draws,
      longTasks: counters.longTasks
        .filter(task => task.startTime >= start)
        .map(task => task.duration),
    };
  }, before.start);
  if (draws === before.draws) {
    throw new Error("Le geste n'a pas fait tourner la caméra.");
  }
  return {programs, longTasks, frameIntervals};
}
