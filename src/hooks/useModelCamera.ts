import {useMemo} from 'react';
import * as THREE from 'three';
import {FOV, FRAMING} from '../utils/camera';

const DEFAULT_CAMERA = {
  position: [0, 7 * FRAMING, -7 * FRAMING] as THREE.Vector3Tuple,
  fov: FOV,
};

export function useModelCamera(cameras: THREE.Camera[], cameraName?: string) {
  return useMemo(() => {
    const camera =
      cameras.find(camera => camera.name === cameraName) ?? cameras[0];
    if (!camera) return DEFAULT_CAMERA;

    camera.updateWorldMatrix(true, false);
    // Recule depuis la cible d'OrbitControls, l'origine.
    const position = camera
      .getWorldPosition(new THREE.Vector3())
      .multiplyScalar(FRAMING)
      .toArray();
    return {...DEFAULT_CAMERA, position};
  }, [cameras, cameraName]);
}
