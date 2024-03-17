import {Canvas, Vector3, useLoader, useThree} from '@react-three/fiber';
import {useEffect, useRef, useState} from 'react';
import {OrbitControls, PerspectiveCamera} from '@react-three/drei';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {useEntity} from '@hakit/core';
import {Bloom, EffectComposer} from '@react-three/postprocessing';
//1170*1027
export function House() {
  const HouseModel = useLoader(
    GLTFLoader,
    process.env.PUBLIC_URL + 'model.glb'
  );
  const light = useEntity('light.sejour');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(HouseModel.scene);
    const size = box.getSize(new THREE.Vector3());
    HouseModel.scene.position.set(-size.x / 2, 0, size.z / 2);
    HouseModel.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material.envMapIntensity = 20;
      }
    });

    const calculateCameraY = () => {
      if (cameraRef.current === null || canvasRef.current === null) return;
      const camera = cameraRef.current;
      const aspect =
        canvasRef.current.clientHeight / canvasRef.current.clientWidth;

      if (aspect < 1) return;

      const maxDim = Math.max(size.x, size.y);
      const fov = camera.fov * (Math.PI / 180);
      const cameraY = (maxDim / 2 / Math.tan(fov / 2)) * aspect;

      camera.position.set(0, cameraY, 0);
    };

    calculateCameraY();
    window.addEventListener('resize', calculateCameraY);

    return () => {
      window.removeEventListener('resize', calculateCameraY);
    };
  }, [HouseModel]);

  return (
    <Canvas shadows flat ref={canvasRef}>
      {/**<OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} /> */}
      <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={Math.PI / 2} />
      <PerspectiveCamera
        makeDefault
        fov={50}
        position={[0, 12, 0]}
        ref={cameraRef}
      />
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
          shadow-bias={-0.0001}
          shadow-normalBias={0.05}
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
    shadow-bias={-0.0001}
    shadow-normalBias={0.05}
  />
);
//<PerspectiveCamera makeDefault fov={50} position={[0, 12, 0]} />
