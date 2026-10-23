import {useThree} from '@react-three/fiber';
import {useEffect} from 'react';
import * as THREE from 'three';
import type {RenderBackend} from '../../rendering/backends';

export type MotionBenchmarkResult = {
  frames: number;
  fps: number;
  worstMs: number;
  pixelRatio: number;
};

export type BenchmarkResult = {
  frames: number;
  msPerFrame: number;
  fps: number;
  cpuMs: number;
  gpuMs: number;
  browserFps: number;
  pixelRatio: number;
};

declare global {
  interface Window {
    __dashboardBenchmark?: (
      frames?: number,
      pixelRatio?: number,
    ) => Promise<BenchmarkResult>;
    __dashboardMotionBenchmark?: (
      frames?: number,
    ) => Promise<MotionBenchmarkResult>;
  }
}

const round = (value: number) => Math.round(value * 10) / 10;
const nextFrame = () =>
  new Promise<number>(resolve => requestAnimationFrame(resolve));

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
      const camera = mainCamera.clone();
      const previousPixelRatio = viewport.dpr;
      const initialPosition = camera.position.clone();
      const center = new THREE.Vector3(...target);
      const offset = initialPosition.clone().sub(center);

      if (pixelRatio) {
        setDpr(pixelRatio);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
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
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      const measuredPixelRatio = gl.getPixelRatio();

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

    window.__dashboardMotionBenchmark = async (frames = 120) => {
      const {camera, invalidate} = get();
      const center = new THREE.Vector3(...target);
      const initialPosition = camera.position.clone();
      const offset = initialPosition.clone().sub(center);
      const axis = new THREE.Vector3(0, 1, 0);
      let pixelRatio = 0;

      let last = await nextFrame();
      const start = last;
      let worstMs = 0;
      for (let i = 1; i <= frames; i++) {
        camera.position
          .copy(offset)
          .applyAxisAngle(axis, (i / frames) * Math.PI * 2)
          .add(center);
        invalidate();
        const now = await nextFrame();
        worstMs = Math.max(worstMs, now - last);
        last = now;
        if (i === frames >> 1) pixelRatio = get().viewport.dpr;
      }
      const msPerFrame = (last - start) / frames;

      camera.position.copy(initialPosition);
      invalidate();

      return {
        frames,
        fps: round(1000 / msPerFrame),
        worstMs: round(worstMs),
        pixelRatio,
      };
    };

    return () => {
      delete window.__dashboardBenchmark;
      delete window.__dashboardMotionBenchmark;
    };
  }, [get, target, backend]);

  return null;
}
