import {useEffect, useMemo} from 'react';
import type * as THREE from 'three';
import type {HouseConfigType} from '../configs/house';
import {createFloorPlan} from '../rendering/floorPlan';
import {createTemperatureMap} from '../rendering/shaders/HeatmapGroundMaterial/common';
import {
  distancesFrom,
  doorDistances,
  temperatureField,
} from '../utils/temperatureField';
import {useHeatmapPoints} from './useHeatmapPoints';

/**
 * Carte des températures du sol, pièce par pièce, tirée des murs du modèle.
 * Les pièces extérieures en restent à l'écart, capteurs compris.
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
  const doors = useMemo(() => plan && doorDistances(plan), [plan]);
  const positions = JSON.stringify(points.map(({x, z}) => [x, z]));
  const sensors = useMemo(
    () => plan && points.map(({x, z}) => distancesFrom(plan, x, z)),
    [plan, positions],
  );

  const temperatures = JSON.stringify(points.map(point => point.temperature));
  const map = useMemo(() => {
    if (!plan || !doors || !sensors?.length) return undefined;
    const field = temperatureField(
      plan,
      doors,
      sensors,
      points.map(point => point.temperature),
    );
    return createTemperatureMap(plan, field, points);
  }, [doors, sensors, temperatures]);
  useEffect(() => () => map?.texture.dispose(), [map]);
  return map;
}
