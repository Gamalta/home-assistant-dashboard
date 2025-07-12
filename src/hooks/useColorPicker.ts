import {useEffect, useRef, useState} from 'react';
import {useLightModalContext} from '../contexts/LightModalContext';
import {HassEntityWithService, temperature2rgb} from '@hakit/core';
import {
  getColorFromCoord,
  getColorTempFromCoord,
  getCoordFromColor,
  getCoordFromColorTemp,
} from '../utils/color';

type Color = [number, number, number];
type Temperature = number;
export type WheelMode = 'color' | 'temperature';
export type ColorWheel<T extends WheelMode> = T extends 'color'
  ? Color
  : Temperature;

export const useColorPicker = <T extends WheelMode>(
  canvas: HTMLCanvasElement | null,
  mode: T,
  minKelvin = 0,
  maxKelvin = 0
) => {
  const [color, setColor] = useState<ColorWheel<T>>(
    (mode === 'color' ? [0, 0, 0] : 0) as ColorWheel<T>
  );

  const {entities, activeEntityIds} = useLightModalContext();
  const activeEntityIdsRef = useRef(activeEntityIds);
  activeEntityIdsRef.current = activeEntityIds;

  const activeEntityState = entities.find(entity =>
    activeEntityIds.includes(entity.entity_id)
  )?.state;

  useEffect(() => {
    if (!entities[0]) return;
    const entity =
      entities.find(entity => activeEntityIds.includes(entity.entity_id)) ??
      entities[0];
    const newColor = getEntityColor(entity);
    setColor(newColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntityState]);

  const rgbColor =
    mode === 'color'
      ? (color as ColorWheel<'color'>)
      : temperature2rgb(color as ColorWheel<'temperature'>);

  const getColorFromCoordWheel = (x: number, y: number): ColorWheel<T> => {
    let color: ColorWheel<T>;
    if (mode === 'color') {
      color = getColorFromCoord(x, y) as ColorWheel<T>;
    } else {
      color = getColorTempFromCoord(
        x,
        y,
        minKelvin,
        maxKelvin
      ) as ColorWheel<T>;
    }
    return color;
  };

  const getCoordFromColorWheel = (color: ColorWheel<T>) => {
    if (mode === 'color') {
      return getCoordFromColor(canvas, color as ColorWheel<'color'>);
    } else {
      return getCoordFromColorTemp(
        canvas,
        color as ColorWheel<'temperature'>,
        minKelvin,
        maxKelvin
      );
    }
  };

  const getNeerEntity = (
    x: number,
    y: number,
    entities: HassEntityWithService<'light'>[]
  ): HassEntityWithService<'light'> | undefined => {
    let bestDistance = 999;
    let neerEntity;

    entities.map(entity => {
      const coord = getCoordFromColorWheel(getEntityColor(entity));
      const distance = Math.hypot(coord.x - x, coord.y - y);
      if (distance < 10 && distance < bestDistance) {
        bestDistance = distance;
        neerEntity = entity;
      }
    });
    return neerEntity;
  };

  const getEntityColor = (entity: HassEntityWithService<'light'>) => {
    let color;
    if (mode === 'color') {
      color = entity.attributes.rgb_color ?? [255, 255, 255];
    } else {
      //TODO behind don't work color_temp alaways return null
      color = entity.attributes.color_temp ?? 5000;
    }
    return color as ColorWheel<T>;
  };

  const setEntitiesColor = (
    entities: HassEntityWithService<'light'>[],
    color: ColorWheel<T>
  ) => {
    if (mode === 'color') {
      entities.map(entity =>
        entity.service.turnOn({
          serviceData: {rgb_color: color as ColorWheel<'color'>},
        })
      );
    } else {
      entities.map(entity =>
        entity.service.turnOn({
          serviceData: {
            color_temp_kelvin: color as ColorWheel<'temperature'>,
          } as object, // types object for bypass type missing on hakit
        })
      );
    }
  };

  return {
    color: rgbColor,
    setColor,
    getNeerEntity,
    getCoordFromColorWheel,
    getColorFromCoordWheel,
    getEntityColor,
    setEntitiesColor,
  };
};
