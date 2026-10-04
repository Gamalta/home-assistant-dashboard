import {useThree} from '@react-three/fiber';
import {useEffect} from 'react';
import * as THREE from 'three';
import type {RenderBackend} from './backends';

export type BenchmarkResult = {
  frames: number;
  /** Image complète : préparation (CPU) + exécution sur le GPU. */
  msPerFrame: number;
  fps: number;
  /** Temps passé dans `render()` : préparation de la scène par three.js. */
  cpuMs: number;
  /** Attente de la fin du travail GPU après `render()`. */
  gpuMs: number;
  /**
   * Cadence réelle du navigateur (boucle de R3F, overlays HTML, composition
   * de la page) : très inférieure à `fps` si le temps est perdu hors rendu.
   */
  browserFps: number;
  pixelRatio: number;
};

declare global {
  interface Window {
    /** Mesure le temps de rendu de la scène (voir modale Système > Debug). */
    __dashboardBenchmark?: (
      frames?: number,
      pixelRatio?: number,
    ) => Promise<BenchmarkResult>;
  }
}

const round = (value: number) => Math.round(value * 10) / 10;
const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

/**
 * Rend `frames` images en faisant tourner la caméra autour de sa cible, en
 * attendant la fin du travail GPU à chaque image pour en mesurer le vrai
 * coût, puis mesure la cadence réelle de la boucle de rendu.
 */
export function Benchmark(props: {
  target: THREE.Vector3Tuple;
  backend: RenderBackend;
}) {
  const {target, backend} = props;
  const get = useThree(state => state.get);

  useEffect(() => {
    window.__dashboardBenchmark = async (frames = 60, pixelRatio) => {
      const {
        gl,
        scene,
        camera: mainCamera,
        viewport,
        invalidate,
        setDpr,
      } = get();
      // Copie de la caméra : déplacer la caméra principale déclencherait
      // OrbitControls et la résolution réduite « en mouvement ».
      const camera = mainCamera.clone();
      const previousPixelRatio = viewport.dpr;
      const initialPosition = camera.position.clone();
      const center = new THREE.Vector3(...target);
      const offset = initialPosition.clone().sub(center);

      // Via R3F (et non gl.setPixelRatio) : sinon R3F rétablit sa propre
      // résolution au prochain redimensionnement, en pleine mesure.
      if (pixelRatio) {
        setDpr(pixelRatio);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      // Images de préchauffage hors mesure : compilation des shaders et
      // réallocation des tampons après un changement de résolution.
      for (let i = 0; i < 3; i++) {
        gl.render(scene, camera);
        await backend.waitForGpu(gl);
      }

      let cpu = 0;
      let gpu = 0;
      for (let i = 0; i < frames; i++) {
        const angle = (i / frames) * Math.PI * 2;
        camera.position
          .copy(offset)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)
          .add(center);
        camera.lookAt(center);
        const start = performance.now();
        gl.render(scene, camera);
        const submitted = performance.now();
        await backend.waitForGpu(gl);
        cpu += submitted - start;
        gpu += performance.now() - submitted;
        // Laisse respirer le navigateur (et le rendu des overlays).
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      const measuredPixelRatio = gl.getPixelRatio();

      // Cadence réelle : une image demandée à R3F à chaque rafraîchissement.
      await nextFrame();
      const loopStart = performance.now();
      for (let i = 0; i < frames; i++) {
        invalidate();
        await nextFrame();
      }
      const browserMs = (performance.now() - loopStart) / frames;

      if (pixelRatio) setDpr(previousPixelRatio);
      invalidate();

      const msPerFrame = (cpu + gpu) / frames;
      return {
        frames,
        msPerFrame: round(msPerFrame),
        fps: round(1000 / msPerFrame),
        cpuMs: round(cpu / frames),
        gpuMs: round(gpu / frames),
        browserFps: round(1000 / browserMs),
        pixelRatio: measuredPixelRatio,
      };
    };
    return () => {
      delete window.__dashboardBenchmark;
    };
  }, [get, target, backend]);

  return null;
}
