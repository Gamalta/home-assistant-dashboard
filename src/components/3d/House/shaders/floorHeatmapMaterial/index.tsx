import {useThree} from '@react-three/fiber';
import {useEffect, useRef} from 'react';
import * as THREE from 'three';

import heatmapFloorFragment from './heatmapFloor.fragment.glsl?raw';
import heatmapFloorVertex from './heatmapFloor.vertex.glsl?raw';

export function HeatmapGround() {
  const {scene} = useThree();
  const floorRef = useRef<THREE.Mesh | undefined>(undefined);

  const points = [
    {x: -5, z: -3, temp: 18},
    {x: 5, z: -5, temp: 24},
    {x: -5, z: 3.5, temp: 30},
    {x: 5, z: 3.5, temp: 21},
    {x: 0, z: 0, temp: 26},
    {x: 3, z: -2, temp: 28},
  ];

  const minTemp = Math.min(...points.map(point => point.temp));
  const maxTemp = Math.max(...points.map(point => point.temp));

  useEffect(() => {
    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;

      const mats = Array.isArray(object.material) ? object.material : [object.material];
      const isNewFloor = mats.some(material => material?.name === 'heatmapFloor');
      if (isNewFloor) return;

      const isFloor = mats.some(material =>
        material?.name?.toLowerCase().includes('room_76_452'),
      );

      if (!isFloor) {
        mats.forEach(material => {
          if (!material) return;
          material.transparent = true;
          const currentOpacity = material.opacity ?? 1;
          material.opacity = currentOpacity / 3;
          material.needsUpdate = true;
        });
        return;
      }
      floorRef.current = object;
      object.geometry.computeBoundingBox();

      const shaderMaterial = new THREE.ShaderMaterial({
        name: 'heatmapFloor',
        transparent: false,
        depthWrite: true,
        side: THREE.FrontSide,
        uniforms: {
          points: {
            value: points.map(p => new THREE.Vector3(p.x, p.temp, p.z)),
          },
          minTemp: {value: minTemp},
          maxTemp: {value: maxTemp},
          numPoints: {value: points.length},
        },
        vertexShader: heatmapFloorVertex,
        fragmentShader: heatmapFloorFragment,
      });

      if (Array.isArray(object.material)) object.material[0] = shaderMaterial;
      else object.material = shaderMaterial;
    });
  }, [scene]);

  return null;
}
