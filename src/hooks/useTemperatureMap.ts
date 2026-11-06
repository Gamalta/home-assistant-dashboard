import {useEffect, useMemo, useRef} from 'react';
import type * as THREE from 'three';
import type {HouseConfigType} from '../configs/house';
import {createFloorPlan} from '../rendering/floorPlan';
import {createTemperatureMap} from '../rendering/shaders/HeatmapGroundMaterial/common';
import {distancesFrom, temperatureField} from '../utils/temperatureField';
import {useHeatmapPoints} from './useHeatmapPoints';

/**
 * Carte des températures du sol : la chaleur des capteurs se diffuse par les
 * portes du modèle. Les pièces extérieures en restent à l'écart, capteurs
 * compris.
 */
export function useTemperatureMap(
  scene: THREE.Object3D,
  rooms: HouseConfigType['rooms'],
  outdoorFloors: Set<THREE.Material>,
  enabled: boolean,
) {
  const points = useHeatmapPoints(rooms.filter(room => !room.outdoor));
  const plan = useMemo(
    () => (enabled ? createFloorPlan(scene, outdoorFloors) : undefined),
    [scene, outdoorFloors, enabled],
  );
  // Le plus long à calculer, mais ne dépend que des murs et de la place des
  // capteurs : une fois à l'activation de la carte.
  const positions = JSON.stringify(points.map(({x, z}) => [x, z]));
  const sensors = useMemo(
    () => plan && points.map(({x, z}) => distancesFrom(plan, x, z)),
    [plan, positions],
  );

  const temperatures = JSON.stringify(points.map(point => point.temperature));
  const previous = useRef<Float32Array>(undefined);
  const map = useMemo(() => {
    if (!plan || !sensors?.length) return undefined;
    const field = temperatureField(
      plan,
      sensors,
      points.map(point => point.temperature),
      previous.current,
    );
    previous.current = field;
    return createTemperatureMap(plan, field, points);
  }, [sensors, temperatures]);
  useEffect(() => () => map?.texture.dispose(), [map]);
  return map;
}
