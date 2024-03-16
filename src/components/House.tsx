import {Canvas, useLoader} from '@react-three/fiber';
import {useEffect} from 'react';
import {OrbitControls, PerspectiveCamera} from '@react-three/drei';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

export function House() {
  const gltf = useLoader(GLTFLoader, process.env.PUBLIC_URL + 'model.glb');

  useEffect(() => {
    gltf.scene.position.set(-4.85, 0, 4.32);
    gltf.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material.envMapIntensity = 20;
      }
    });
  }, [gltf]);

  // porte 9349.46 /2 = 4674.73
  // 8270.49 / 2 = 4135.24

  return (
    <Canvas shadows>
      <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />
      <PerspectiveCamera makeDefault fov={50} position={[0, 12, 0]} />
      <ambientLight intensity={1} />
      <directionalLight
        castShadow
        position={[0, 5, 4]}
        intensity={0.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <directionalLight
        castShadow
        position={[0, 5, -4]}
        intensity={0.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <directionalLight
        castShadow
        position={[4, 5, 0]}
        intensity={0.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <primitive object={new THREE.AxesHelper(10)} />
      <primitive object={gltf.scene} />
      <mesh position={[0, 2.55, 0]} castShadow>
        <boxGeometry args={[10, 0.1, 9]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </Canvas>
  );
}
