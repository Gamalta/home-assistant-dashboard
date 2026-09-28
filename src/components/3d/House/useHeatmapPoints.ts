import {useEntities} from '@hakit/core';
import type {HouseConfigType, RoomItemConfigType} from '../../../configs/house';
import type {HeatmapPoint} from './shaders/HeatmapGroundMaterial/common';

type TemperatureItem = Extract<
  RoomItemConfigType,
  {temperatureEntityId?: string}
>;

/** Températures actuelles de chaque capteur, placées sur le sol (x, z). */
export function useHeatmapPoints(rooms: HouseConfigType['rooms']) {
  const sensors = rooms.flatMap(room =>
    (room.items ?? [])
      .filter(
        (item): item is TemperatureItem =>
          'temperatureEntityId' in item && !!item.temperatureEntityId,
      )
      .map(item => {
        const position = item.roomDisplay ? room.position : item.position;
        return {
          x: position.x,
          z: position.z,
          entityId: item.temperatureEntityId!,
        };
      }),
  );

  const temperatureEntities = useEntities(
    sensors.map(sensor => sensor.entityId),
    // Seul l'état courant est utilisé : inutile de charger l'historique.
    {returnNullIfNotFound: true, historyOptions: {disable: true}},
  );

  return sensors
    .map(sensor => {
      const entity = temperatureEntities.find(
        entity => entity?.entity_id === sensor.entityId,
      );
      const temperature = Number(entity?.state);
      if (!entity || isNaN(temperature)) return undefined;
      return {x: sensor.x, z: sensor.z, temperature};
    })
    .filter((point): point is HeatmapPoint => !!point);
}
