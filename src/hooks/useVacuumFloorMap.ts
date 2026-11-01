import {useEntities, useHass, type EntityName} from '@hakit/core';
import {useEffect, useState} from 'react';
import * as THREE from 'three';
import type {HouseConfigType, RoomItemConfigType} from '../configs/house';
import {
  EMPTY_FLOOR_MAP,
  type FloorMap,
} from '../rendering/shaders/VacuumMapGroundMaterial/common';
import {
  floorToMapUv,
  vacuumEntityIds,
  type CalibrationPoint,
} from '../utils/entity/vacuum';

type VacuumItem = Extract<RoomItemConfigType, {type: 'vacuum'}>;

/** Plan du premier aspirateur de la maison, à poser sur le sol de la scène. */
export function useVacuumFloorMap(
  rooms: HouseConfigType['rooms'],
  enabled: boolean,
): FloorMap | undefined {
  const vacuum = rooms
    .flatMap(room => room.items ?? [])
    .find((item): item is VacuumItem => item.type === 'vacuum');
  const mapIds: EntityName[] = vacuum
    ? [vacuumEntityIds(vacuum.prefix).map]
    : [];
  const [map] = useEntities(mapIds, {
    returnNullIfNotFound: true,
    historyOptions: {disable: true},
  });
  const joinHassUrl = useHass(state => state.helpers.joinHassUrl);
  const picture: string | undefined = enabled
    ? map?.attributes.entity_picture
    : undefined;
  const [texture, setTexture] = useState<THREE.Texture>();

  // Chargé à la main : useLoader suspendrait la scène à chaque nouvelle
  // carte, et les garderait toutes en cache.
  useEffect(() => {
    if (!picture) return;
    let current = true;
    new THREE.TextureLoader().load(
      joinHassUrl(picture),
      loaded => {
        if (!current) return loaded.dispose();
        loaded.flipY = false;
        loaded.colorSpace = THREE.SRGBColorSpace;
        setTexture(loaded);
      },
      undefined,
      () =>
        console.warn(
          "Plan de l'aspirateur illisible : l'origine du tableau de bord est-elle dans cors_allowed_origins ?",
        ),
    );
    return () => {
      current = false;
    };
  }, [picture, joinHassUrl]);
  // Libère aussi le GPU quand l'option se coupe : three renverrait l'image au
  // besoin.
  useEffect(() => () => texture?.dispose(), [texture, enabled]);

  if (!vacuum || !enabled) return undefined;
  const calibration: CalibrationPoint[] | undefined =
    map?.attributes.calibration_points;
  const image = texture?.image as HTMLImageElement | undefined;
  if (!texture || !image || !calibration) return EMPTY_FLOOR_MAP;
  return {
    texture,
    uv: floorToMapUv(calibration, image, vacuum.mapAlignment),
  };
}
