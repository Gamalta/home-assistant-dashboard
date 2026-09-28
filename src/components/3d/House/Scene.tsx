import {useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {useAppContext} from '../../../contexts/AppContext';
import type {RenderBackend} from '../backends';

type SceneProps = {
  scene: THREE.Group;
  backend: RenderBackend;
};

export function Scene(props: SceneProps) {
  const {scene, backend} = props;
  const gl = useThree(state => state.gl);
  const {setRendererInfo} = useAppContext();

  useEffect(() => {
    let triangles = 0;

    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;

      triangles +=
        (object.geometry.index?.count ??
          object.geometry.attributes.position.count) / 3;
    });

    // Lu sur le renderer existant : en créer un nouveau ouvrirait un contexte
    // WebGL supplémentaire (et les navigateurs en limitent le nombre).
    setRendererInfo({triangles, maxTextures: backend.getMaxTextures(gl)});
  }, [scene, gl, backend, setRendererInfo]);

  return <primitive object={scene} />;
}
