import {useMemo} from 'react';
import * as THREE from 'three';

const DEFAULT_CAMERA = {
  position: [0, 7, -7] as THREE.Vector3Tuple,
  fov: 75,
};

export function useModelCamera(cameras: THREE.Camera[], cameraName?: string) {
  return useMemo(() => {
    const camera =
      cameras.find(camera => camera.name === cameraName) ?? cameras[0];
    if (!camera) return DEFAULT_CAMERA;

    camera.updateWorldMatrix(true, false);
    const position = camera.getWorldPosition(new THREE.Vector3()).toArray();
    return {...DEFAULT_CAMERA, position};
  }, [cameras, cameraName]);
}
