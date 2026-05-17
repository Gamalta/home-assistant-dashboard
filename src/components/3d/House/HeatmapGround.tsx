import {useThree} from '@react-three/fiber';
import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {HouseConfigType, RoomItemConfigType} from '../../../configs/house';
import {useEntities} from '@hakit/core';
import {
  createHeatmapGroundMaterial,
  HeatmapPoint,
} from './shaders/HeatmapGroundMaterial';
import {useAppContext} from '../../../contexts/AppContext';

type HeatmapGroundProps = {
  rooms: HouseConfigType['rooms'];
};

export function HeatmapGround(props: HeatmapGroundProps) {
  const {rooms} = props;
  const {configuration} = useAppContext();
  const {scene, invalidate} = useThree();
  const groundRef = useRef<THREE.Mesh | undefined>(undefined);

  const heatmapPointsWithId = rooms.flatMap(room => {
    const roomPosition = room.position;

    return (room.items ?? [])
      .filter(
        (
          item,
        ): item is Extract<RoomItemConfigType, {temperatureEntityId: string}> =>
          'temperatureEntityId' in item,
      )
      .map(item => {
        const position = item.roomDisplay ? roomPosition : item.position;

        return {
          x: position.x,
          z: position.z,
          temperature: item.temperatureEntityId,
        };
      });
  });

  const temperatureEntities = useEntities(
    heatmapPointsWithId.map(point => point.temperature),
    {
      returnNullIfNotFound: true,
      historyOptions: {
        disable: false,
        hoursToShow: 24,
      },
    },
  );

  const heatmapPoints = heatmapPointsWithId
    .map(point => {
      const entity = temperatureEntities.find(
        entity => entity?.entity_id === point.temperature,
      );
      if (!entity || isNaN(Number(entity.state))) return undefined;
      return {
        ...point,
        temperature: Number(entity?.state),
      };
    })
    .filter((point): point is HeatmapPoint => !!point);

  useEffect(() => {
    const oldMaterials = new Map<
      THREE.Mesh,
      THREE.Material | THREE.Material[]
    >();

    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      const isNewGround = materials.some(
        material => material?.name === 'heatmapGround',
      );
      if (isNewGround) return;

      const isGround = materials.some(material =>
        material?.name?.toLowerCase()?.startsWith('room_'),
      );

      oldMaterials.set(
        object,
        Array.isArray(object.material)
          ? object.material.map(material => material.clone())
          : object.material.clone(),
      );

      if (!isGround) {
        materials.forEach(material => {
          if (!material) return;
          material.transparent = true;
          const currentOpacity = material.opacity ?? 1;
          material.opacity = currentOpacity / 3;
          material.depthWrite = false;
          material.needsUpdate = true;
        });
        return;
      }

      groundRef.current = object;
      object.geometry.computeBoundingBox();
      const heatmapMaterial = createHeatmapGroundMaterial(
        configuration.webGPU,
        heatmapPoints,
      );
      if (Array.isArray(object.material)) object.material[0] = heatmapMaterial;
      else object.material = heatmapMaterial;
    });

    return () => {
      oldMaterials.forEach((oldMaterial, mesh) => {
        const currentMaterials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        currentMaterials.forEach(material => material?.dispose());
        mesh.material = oldMaterial;
      });
    };
  }, [scene, configuration.heatmapShader, configuration.hideWallsShader]);

  useEffect(() => invalidate(), []);

  return null;
}
