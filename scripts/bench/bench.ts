import {execSync} from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {parseArgs} from 'node:util';
import {chromium} from '@playwright/test';
import {build, preview} from 'vite';
import {
  benchmarkAtRest,
  openHouse,
  rotate,
  type GraphicsOptions,
} from './measure.ts';
import {formatReport, toRow, type BenchRun} from './report.ts';

const SCENARIOS: Record<string, GraphicsOptions> = {
  defaut: {},
  ombres: {shadows: true},
  reflets: {environmentReflections: true},
  chaleur: {heatmapShader: true},
};
const VIEWPORT = {width: 1280, height: 800};

const {values: args} = parseArgs({
  options: {
    url: {type: 'string'},
    houses: {type: 'string'},
    options: {type: 'string', default: 'defaut,ombres,reflets'},
    cpu: {type: 'string', default: '1'},
    ci: {type: 'boolean', default: false},
    compare: {type: 'string'},
    out: {type: 'string', default: 'bench.json'},
  },
});

const houses = args.houses?.split(',') ?? [
  'demo',
  ...(existsSync('src/configs/apartment/House.ts') ? ['apartment'] : []),
];
const scenarios = args.options.split(',');
const cpuSlowdown = Number(args.cpu);
for (const name of scenarios) {
  if (!SCENARIOS[name]) throw new Error(`Options inconnues : ${name}`);
}
// Lu avant de lancer quoi que ce soit : `--compare` peut viser le fichier `--out`.
const before: BenchRun | undefined =
  args.compare && JSON.parse(readFileSync(args.compare, 'utf8'));

async function serveBuild() {
  const outDir = mkdtempSync(join(tmpdir(), 'dashboard-bench-'));
  Object.assign(process.env, {
    VITE_MOCK_HOME_ASSISTANT: 'true',
    VITE_HOUSE_CONFIGS: JSON.stringify(houses),
    SENTRY_AUTH_TOKEN: '',
  });
  await build({build: {outDir, emptyOutDir: true}, logLevel: 'error'});
  const server = await preview({build: {outDir}, logLevel: 'error'});
  return {
    url: server.resolvedUrls!.local[0],
    close: async () => {
      await server.close();
      rmSync(outDir, {recursive: true});
    },
  };
}

// Chrome du système, avec le GPU de la machine ; sinon, ou avec --ci, le
// Chromium de Playwright en rendu logiciel, comme les E2E.
async function launchBrowser() {
  if (!args.ci) {
    try {
      const browser = await chromium.launch({
        channel: 'chrome',
        // Sinon, un GPU sur liste noire passe en rendu logiciel sans prévenir.
        args: ['--ignore-gpu-blocklist'],
      });
      return {browser, pixelRatio: 2};
    } catch {
      console.error('Chrome introuvable : rendu logiciel SwiftShader.');
    }
  }
  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  // À DPR 2, le rendu logiciel prend plusieurs minutes par scénario.
  return {browser, pixelRatio: 1};
}

const server = args.url ? undefined : await serveBuild();
const {browser, pixelRatio} = await launchBrowser();
const blank = await browser.newPage();
const renderer = await blank.evaluate(() => {
  const gl = document.createElement('canvas').getContext('webgl2')!;
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  return gl.getParameter(info?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER);
});
await blank.close();
const run: BenchRun = {
  date: new Date().toISOString(),
  build: args.url ?? execSync('git rev-parse --short HEAD').toString().trim(),
  browser: `Chrome ${browser.version()} · ${renderer}`,
  viewport: `${VIEWPORT.width}×${VIEWPORT.height} @${pixelRatio}`,
  cpuSlowdown,
  rows: [],
};

try {
  for (const house of houses) {
    for (const name of scenarios) {
      console.error(`${house} · ${name}…`);
      const context = await browser.newContext({
        baseURL: args.url ?? server!.url,
        viewport: VIEWPORT,
        deviceScaleFactor: pixelRatio,
      });
      context.setDefaultTimeout(120_000);
      // Pas de données de bench envoyées à Sentry ni à Matomo.
      await context.route(/sentry\.io|matomo\.elihome\.fr/, route =>
        route.fulfill({body: ''}),
      );
      const page = await context.newPage();
      page.on('pageerror', error => console.error(error.message));

      const startupPrograms = await openHouse(page, house, SCENARIOS[name]);
      if (cpuSlowdown > 1) {
        const cdp = await context.newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate', {rate: cpuSlowdown});
      }
      const {drawsPerFrame, cpuMs, gpuMs} = await benchmarkAtRest(page);
      const rotation = await rotate(page);
      run.rows.push(
        toRow(house, name, {
          startupPrograms,
          drawsPerFrame,
          cpuMs,
          gpuMs,
          rotationPrograms: rotation.programs,
          longTasks: rotation.longTasks,
          frameIntervals: rotation.frameIntervals,
        }),
      );
      await context.close();
    }
  }
} finally {
  await browser.close();
  await server?.close();
}

writeFileSync(args.out, `${JSON.stringify(run, null, 2)}\n`);
console.log(formatReport(run, before));
