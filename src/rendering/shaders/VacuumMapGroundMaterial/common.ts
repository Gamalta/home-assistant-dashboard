import * as THREE from 'three';
import type {FloorUv} from '../../../utils/entity/vacuum';

export type FloorMap = {texture: THREE.Texture; uv: FloorUv};

// Image transparente en attendant le plan : le sol reste neutre et le shader,
// déjà compilé, ne change pas à son arrivée.
const emptyTexture = new THREE.DataTexture(new Uint8Array(4), 1, 1);
emptyTexture.needsUpdate = true;

export const EMPTY_FLOOR_MAP: FloorMap = {
  texture: emptyTexture,
  uv: [
    [0, 0, 0],
    [0, 0, 0],
  ],
};

// Le sol autour du plan.
export const FLOOR_COLOR = '#d9d9d9';
