import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import {Suspense, useEffect, useRef} from 'react';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader';
import {OrbitControls, PerspectiveCamera} from '@react-three/drei';
import {BlendFunction} from 'postprocessing';
import {EffectComposer, Bloom} from '@react-three/postprocessing';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
//camera={{position: [350, 900, 450]}}
export function House() {
  return (
    <Suspense fallback={null}>
      <Canvas shadows>
        <Model url={'./Appart.STL'} />
        <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />
        <PerspectiveCamera makeDefault fov={50} position={[3, 2, 5]} />
        <color args={[0, 0, 0]} attach="background" />
        <Car />
        <mesh rotation-x={-Math.PI * 0.5} castShadow receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial // Utilisez un matériau standard pour réagir à la lumière et aux ombres
            color="gray"
            roughness={0.5}
            metalness={0.5}
          />
        </mesh>

        <EffectComposer>
          {/* <DepthOfField focusDistance={0.0035} focalLength={0.01} bokehScale={3} height={480} /> */}
          <Bloom
            blendFunction={BlendFunction.ADD}
            intensity={1.3} // The bloom intensity.
            width={300} // render width
            height={300} // render height
            kernelSize={5} // blur kernel size
            luminanceThreshold={0.15} // luminance threshold. Raise this value to mask out darker elements in the scene.
            luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
          />
        </EffectComposer>
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[350, 1100, 450]}
          intensity={0.5}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={5000}
          shadow-camera-left={-1000}
          shadow-camera-right={1000}
          shadow-camera-top={1000}
          shadow-camera-bottom={-1000}
        />
        <primitive object={new THREE.AxesHelper(10000)} />
      </Canvas>
    </Suspense>
  );
}

export const Model = ({url}: {url: string}) => {
  const geom = useLoader(STLLoader, url);
  geom.scale(0.1, 0.1, 0.1);

  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotateZ(Math.PI / 2);
      meshRef.current.rotateX(Math.PI);
      meshRef.current.rotateY(Math.PI / 2);
    }
  }, []);

  return (
    <>
      <mesh ref={meshRef} scale={[0.1, 0.1, 0.1]} receiveShadow castShadow>
        <primitive object={geom} attach="geometry" />
        <primitive object={new THREE.AxesHelper(500)} />
      </mesh>
      <pointLight position={[350, 1100, 450]} />
      <meshStandardMaterial // Utilisez un matériau standard pour réagir à la lumière et aux ombres
        color="gray"
        roughness={0.5}
        metalness={0.5}
      />
    </>
  );
};

export function Car() {
  const gltf = useLoader(GLTFLoader, process.env.PUBLIC_URL + 'scene.gltf');

  useEffect(() => {
    gltf.scene.scale.set(0.005, 0.005, 0.005);
    gltf.scene.position.set(0, -0.035, 0);
    gltf.scene.traverse((object: any) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material.envMapIntensity = 20;
      }
    });
  }, [gltf]);

  useFrame(state => {
    const t = state.clock.getElapsedTime();

    const group = gltf.scene.children[0].children[0].children[0];
    group.children[0].rotation.x = t * 2;
    group.children[2].rotation.x = t * 2;
    group.children[4].rotation.x = t * 2;
    group.children[6].rotation.x = t * 2;
  });

  return <primitive object={gltf.scene} />;
}
