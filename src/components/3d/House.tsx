import {Canvas, Vector3, useLoader} from '@react-three/fiber';
import {useEffect} from 'react';
import {OrbitControls, PerspectiveCamera} from '@react-three/drei';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {useEntity} from '@hakit/core';
import {Bloom, EffectComposer} from '@react-three/postprocessing';

export function House() {
  const HouseModel = useLoader(
    GLTFLoader,
    process.env.PUBLIC_URL + 'model.glb'
  );

  const light = useEntity('light.sejour');

  useEffect(() => {
    HouseModel.scene.position.set(-4.85, 0, 4.32);
    HouseModel.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material.envMapIntensity = 20;
      }
    });
  }, [HouseModel]);

  return (
    <Canvas shadows flat>
      <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />
      <PerspectiveCamera makeDefault fov={50} position={[0, 12, 0]} />
      <ambientLight intensity={1} />
      <OutsideLight position={[0, 5, 4]} />
      <OutsideLight position={[0, 5, -4]} />
      <OutsideLight position={[4, 5, 0]} />

      {/* Work in progress */}
      {light.state === 'on' && (
        <pointLight
          castShadow
          position={[0, 2, -2]}
          color={light.custom.color}
          intensity={0.5}
          distance={5}
        />
      )}
      {/* End work in progress */}

      {/* House model */}
      <primitive object={HouseModel.scene} />

      {/* Transparent ceiling for lock light */}
      <mesh position={[0, 2.55, 0]} castShadow>
        <boxGeometry args={[10, 0.1, 9]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Test */}
      <EffectComposer>
        <Bloom luminanceThreshold={2} />
      </EffectComposer>
    </Canvas>
  );
}

const OutsideLight = ({position}: {position: Vector3}) => (
  <directionalLight
    castShadow
    position={position}
    intensity={0.5}
    shadow-mapSize-width={1024}
    shadow-mapSize-height={1024}
    shadow-camera-left={-7}
    shadow-camera-right={7}
    shadow-camera-top={7}
    shadow-camera-bottom={-7}
  />
);
