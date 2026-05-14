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
    scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        const geometry = object.geometry;

        if (geometry.index) {
          total += geometry.index.count / 3;
        } else {
          total += geometry.attributes.position.count / 3;
        }
      }
    });
    setTriangle(total);
  }, [scene]);

  return <primitive object={scene} />;
}
