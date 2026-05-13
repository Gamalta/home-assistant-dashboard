import * as THREE from 'three';

type SceneProps = {
  scene: THREE.Group;
};

export function Scene(props: SceneProps) {
  const {scene} = props;
  return <primitive object={scene} />;
}
