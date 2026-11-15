import {useEntity} from '@hakit/core';
import {useThree} from '@react-three/fiber';
import {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import type {ChristmasTreeConfigType} from '../../../configs/house';
import {
  TREE_LIGHTS,
  createTreeBody,
  treeLightColor,
} from '../../../rendering/christmasTree';

// Une image par changement de couleur, pas d'animation continue (ADR 0057).
const STEP_MS = 2000;

type ChristmasTree3dProps = {
  tree: ChristmasTreeConfigType;
};

export function ChristmasTree3d(props: ChristmasTree3dProps) {
  const {tree} = props;
  const {position, height = 1.6, switchEntityId} = tree;
  const invalidate = useThree(state => state.invalidate);
  const plug = useEntity(switchEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  const on = !switchEntityId || plug?.state === 'on';
  const body = useMemo(() => createTreeBody(), []);
  const lights = useRef<THREE.InstancedMesh>(null);

  useEffect(() => () => body.dispose(), [body]);

  // Avant la première image et la précompilation : les couleurs par
  // instance font partie du programme.
  useLayoutEffect(() => {
    const mesh = lights.current!;
    const matrix = new THREE.Matrix4();
    TREE_LIGHTS.forEach((light, index) => {
      matrix.makeScale(light.radius, light.radius, light.radius);
      mesh.setMatrixAt(index, matrix.setPosition(light.position));
      mesh.setColorAt(index, treeLightColor(index, 0));
    });
  }, []);

  useEffect(() => {
    if (!on) return;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const mesh = lights.current!;
      TREE_LIGHTS.forEach((_, index) =>
        mesh.setColorAt(index, treeLightColor(index, step)),
      );
      mesh.instanceColor!.needsUpdate = true;
      invalidate();
    }, STEP_MS);
    return () => clearInterval(interval);
  }, [on, invalidate]);

  return (
    <group position={[position.x, position.y, position.z]} scale={height}>
      <mesh geometry={body}>
        {/* Une lueur propre : la nuit, la scène l'éclaire à peine. */}
        <meshStandardMaterial vertexColors roughness={0.9} emissive="#0c3018" />
      </mesh>
      <instancedMesh
        ref={lights}
        args={[undefined, undefined, TREE_LIGHTS.length]}
        visible={on}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
