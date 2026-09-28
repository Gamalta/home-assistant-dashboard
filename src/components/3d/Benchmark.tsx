import {useThree} from '@react-three/fiber';
import {useEffect} from 'react';
import * as THREE from 'three';

export type BenchmarkResult = {
  frames: number;
  msPerFrame: number;
  fps: number;
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

/**
 * Rend `frames` images en faisant tourner la caméra autour de sa cible, et
 * attend la fin du travail GPU à chaque image (lecture d'un pixel) pour
 * mesurer le vrai coût d'une image, CPU et GPU compris.
 */
export function Benchmark(props: {target: THREE.Vector3Tuple}) {
  const {target} = props;
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
      const context = gl.getContext?.() as WebGL2RenderingContext | undefined;
      const pixel = new Uint8Array(4);
      const sync = () =>
        context?.readPixels?.(0, 0, 1, 1, 0x1908, 0x1401, pixel);

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
        sync();
      }

      const start = performance.now();
      for (let i = 0; i < frames; i++) {
        const angle = (i / frames) * Math.PI * 2;
        camera.position
          .copy(offset)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)
          .add(center);
        camera.lookAt(center);
        gl.render(scene, camera);
        sync();
        // Laisse respirer le navigateur (et le rendu des overlays).
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      const msPerFrame = (performance.now() - start) / frames;
      const measuredPixelRatio = gl.getPixelRatio();

      if (pixelRatio) setDpr(previousPixelRatio);
      invalidate();

      return {
        frames,
        msPerFrame: Math.round(msPerFrame * 10) / 10,
        fps: Math.round((1000 / msPerFrame) * 10) / 10,
        pixelRatio: measuredPixelRatio,
      };
    };
    return () => {
      delete window.__dashboardBenchmark;
    };
  }, [get, target]);

  return null;
}
