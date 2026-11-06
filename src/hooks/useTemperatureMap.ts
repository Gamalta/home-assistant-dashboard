import {useEntities, type EntityName} from '@hakit/core';
import {useEffect, useMemo} from 'react';
import type * as THREE from 'three';
import type {HouseConfigType} from '../configs/house';
import {createFloorPlan} from '../rendering/floorPlan';
import {createTemperatureMap} from '../rendering/shaders/HeatmapGroundMaterial/common';
import {
  distancesFrom,
  temperatureField,
  withOutdoor,
} from '../utils/temperatureField';
import {useHeatmapPoints} from './useHeatmapPoints';

/**
 * Carte des températures du sol : elle contourne les murs du modèle, et les
 * pièces extérieures prennent la température de la météo.
 */
export function useTemperatureMap(
  scene: THREE.Object3D,
  rooms: HouseConfigType['rooms'],
  weatherEntityId: EntityName | undefined,
  enabled: boolean,
) {
  const points = useHeatmapPoints(rooms);
  const weatherIds: EntityName[] = weatherEntityId ? [weatherEntityId] : [];
  const [weather] = useEntities(weatherIds, {
    returnNullIfNotFound: true,
    historyOptions: {disable: true},
  });
  const outdoor: unknown = weather?.attributes.temperature;
  const outdoorTemperature = typeof outdoor === 'number' ? outdoor : undefined;
  const hasOutdoor = rooms.some(room => room.outdoor);

  const plan = useMemo(
    () => (enabled ? createFloorPlan(scene) : undefined),
    [scene, enabled],
  );
  // Le plus long à calculer, mais ne dépend que des murs et de la place des
  // capteurs : une fois à l'activation de la carte.
  const positions = JSON.stringify(points.map(({x, z}) => [x, z]));
  const sensors = useMemo(
    () => plan && points.map(({x, z}) => distancesFrom(plan, x, z)),
    [plan, positions],
  );
  const roomDistances = useMemo(
    () =>
      plan && hasOutdoor
        ? rooms.map(({position}) => distancesFrom(plan, position.x, position.z))
        : undefined,
    [plan, rooms, hasOutdoor],
  );

  const temperatures = JSON.stringify(points.map(point => point.temperature));
  const map = useMemo(() => {
    if (!plan || !sensors?.length) return undefined;
    const field = temperatureField(
      sensors,
      points.map(point => point.temperature),
    );
    return createTemperatureMap(
      plan,
      roomDistances && outdoorTemperature !== undefined
        ? withOutdoor(
            field,
            roomDistances,
            rooms.map(room => !!room.outdoor),
            outdoorTemperature,
          )
        : field,
      points,
    );
  }, [sensors, roomDistances, temperatures, outdoorTemperature]);
  useEffect(() => () => map?.texture.dispose(), [map]);
  return map;
}
