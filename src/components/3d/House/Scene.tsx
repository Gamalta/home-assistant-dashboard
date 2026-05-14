import {useEffect} from 'react';
import * as THREE from 'three';
import {useAppContext} from '../../../contexts/AppContext';

type SceneProps = {
  scene: THREE.Group;
};

export function Scene(props: SceneProps) {
  const {scene} = props;
  const {setTriangle} = useAppContext();

  useEffect(() => {
    let total = 0;
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.receiveShadow = true;
        obj.castShadow = true;

        const geometry = obj.geometry;

        if (geometry.index) {
          total += geometry.index.count / 3;
        } else {
          total += geometry.attributes.position.count / 3;
        }
      }
      if (obj instanceof THREE.Light) {
        obj.castShadow = true;
      }
    });
    setTriangle(total);
  }, [scene]);

  return <primitive object={scene} />;
}
