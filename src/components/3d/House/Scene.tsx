import {useEffect} from 'react';
import * as THREE from 'three';

type SceneProps = {
  scene: THREE.Group;
};

export function Scene(props: SceneProps) {
  const {scene} = props;

  useEffect(() => {
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.receiveShadow = true;
        obj.castShadow = true;
      }
      if (obj instanceof THREE.Light) {
        obj.castShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}
