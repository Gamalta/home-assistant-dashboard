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
      if (!(object instanceof THREE.Mesh)) return;

      total +=
        (object.geometry.index?.count ??
          object.geometry.attributes.position.count) / 3;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach(material => {
        if (!material) return;
        material.depthWrite = false;
      });
    });

    setTriangle(total);
  }, [scene, setTriangle]);

  return <primitive object={scene} />;
}
