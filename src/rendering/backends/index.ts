import type {RenderBackend} from './types';

export type {RenderBackend};

export async function loadRenderBackend(
  webGPU: boolean,
): Promise<RenderBackend> {
  if (webGPU) return (await import('./webgpu')).webGPUBackend;
  return (await import('./webgl')).webGLBackend;
}
