import {DragControls, Point} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';
import {
  HassEntityWithService,
  hsv2rgb,
  rgb2hs,
  temperature2rgb,
} from '@hakit/core';
import {useLightModalContext} from '../contexts/LightModalContext';
import {getRelativePosition} from '../utils/color';
import {
  MAX_KELVIN,
  MIN_KELVIN,
} from '../components/Modal/Type/LightModal/Tabs/ColorTempTab';

//type Mode = 'color' | 'temperature';
type Color = [number, number, number];
type Temperature = number;
type Mode = 'color' | 'temperature';
type UseColor<T extends Mode> = T extends 'color' ? Color : Temperature;

export const useColorPicker = <T extends Mode>(
  canvas: HTMLCanvasElement | null,
  dragControls: DragControls,
  mode: T
) => {
  const [color, setColor] = useState<UseColor<T>>(
    (mode === 'color' ? [0, 0, 0] : 0) as UseColor<T>
  );

  const {
    entities,
    activeEntityIds,
    setActiveEntityIds,
    hoverEntity,
    setHoverEntity,
  } = useLightModalContext();
  const activeEntityIdsRef = useRef(activeEntityIds);
  activeEntityIdsRef.current = activeEntityIds;

  const onClick = (event: MouseEvent) => {
    if (!canvas) return;
    const radius = canvas.clientWidth / 2;
    const {x, y} = getRelativePosition(canvas, event.clientX, event.clientY);
    const newColor = getColorFromCoordWheel(x, y);

    moveDragControls(dragControls, x * radius, y * radius);
    setColor(newColor);

    setEntitiesColor(
      entities.filter(entity =>
        activeEntityIdsRef.current.includes(entity.entity_id)
      ),
      newColor
    );
  };

  const onDrag = (_: unknown, info: {point: Point}) => {
    if (!canvas) return;
    const {x: pointX, y: pointY} = info.point;
    const {x: tempX, y: tempY} = getRelativePosition(canvas, pointX, pointY);
    const distanceFromMiddle = Math.hypot(tempX, tempY);
    const radius = canvas.clientWidth / 2;
    let {x, y} = {x: tempX, y: tempY};

    if (distanceFromMiddle > 1 || distanceFromMiddle < 0) {
      const angle = Math.atan2(tempY, tempX);
      x = radius * Math.cos(angle);
      y = radius * Math.sin(angle);
      moveDragControls(dragControls, x, y);
    }

    const newColor = getColorFromCoordWheel(x, y);
    setColor(newColor);

    const neerEntity = getNeerEntity(x, y, entities);
    setHoverEntity(neerEntity?.entity_id);
  };

  const onDragEnd = (_: unknown, info: {point: Point}) => {
    if (!canvas) return;
    const {x, y} = getRelativePosition(canvas, info.point.x, info.point.y);
    const newColor = getColorFromCoordWheel(x, y);
    setColor(newColor);

    if (hoverEntity) {
      setActiveEntityIds(activeEntities => [hoverEntity, ...activeEntities]);
    }

    setEntitiesColor(
      entities.filter(entity => activeEntityIds.includes(entity.entity_id)),
      newColor
    );
  };

  const activeEntityState = entities.find(entity =>
    activeEntityIds.includes(entity.entity_id)
  )?.state;

  useEffect(() => {
    if (!canvas || !entities[0]) return;
    const entity =
      entities.find(entity => activeEntityIds.includes(entity.entity_id)) ??
      entities[0];
    const newColor = getEntityColor(entity);
    const {x, y} = getCoordFromColorWheel(newColor);
    const radius = canvas.clientWidth / 2;
    moveDragControls(dragControls, x * radius, y * radius);
    setColor(newColor);

    canvas.addEventListener('click', onClick);
    return () => {
      canvas.removeEventListener('click', onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, activeEntityState]);

  const getColorFromCoordWheel = (x: number, y: number): UseColor<T> => {
    let color: UseColor<T>;
    if (mode === 'color') {
      color = getColorFromCoord(x, y) as UseColor<T>;
    } else {
      color = getTemperatureFromCoord(x, y) as UseColor<T>;
    }
    return color;
  };

  const getCoordFromColorWheel = (color: UseColor<T>) => {
    if (mode === 'color') {
      return getCoordFromColor(color as UseColor<'color'>);
    } else {
      return getCoordFromTemperature(color as UseColor<'temperature'>);
    }
  };

  const getEntityColor = (entity: HassEntityWithService<'light'>) => {
    let color;
    if (mode === 'color') {
      color = entity.attributes.rgb_color ?? [255, 255, 255];
    } else {
      color = entity.attributes.color_temp ?? 5000;
      console.log('colorElise', color);
    }
    return color as UseColor<T>;
  };

  const setEntitiesColor = (
    entities: HassEntityWithService<'light'>[],
    color: UseColor<T>
  ) => {
    const rgb_color =
      mode === 'color'
        ? (color as UseColor<'color'>)
        : temperature2rgb(color as UseColor<'temperature'>);
    entities.map(entity => {
      entity.service.turnOn({rgb_color});
    });
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
      if (distance < 0.3 && distance < bestDistance) {
        bestDistance = distance;
        neerEntity = entity;
      }
    });
    return neerEntity;
  };

  const rgbColor =
    mode === 'color'
      ? (color as UseColor<'color'>)
      : temperature2rgb(color as UseColor<'temperature'>);
  return {color: rgbColor, onDrag, onDragEnd};
};

const moveDragControls = (dragControls: DragControls, x: number, y: number) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dragControls as any).componentControls.forEach((entry: any) => {
    entry.getAxisMotionValue('x').set(x);
    entry.getAxisMotionValue('y').set(y);
  });
};

export const getColorFromCoord = (x: number, y: number) => {
  const hue = Math.round((Math.atan2(y, x) / (2 * Math.PI)) * 360) % 360;
  const saturation = Math.round(Math.min(Math.hypot(x, y), 1) * 100) / 100;
  return hsv2rgb([hue, saturation, 255]);
};

export const getTemperatureFromCoord = (_: number, y: number) => {
  const fraction = (y / 0.9 + 1) / 2;

  // Calculer la température
  const temp = Math.max(
    Math.min(MIN_KELVIN + fraction * (MAX_KELVIN - MIN_KELVIN), MAX_KELVIN),
    MIN_KELVIN
  );
  return temp;
};

/**
 * color const fraction = (y / SAFE_ZONE_FACTOR + 1) / 2;
      const temperature = Math.max(Math.min(min + fraction * (max - min), max), min);
      return Math.round(temperature);
 *
 */

export const getCoordFromColor = (color: [number, number, number]) => {
  const [hue, saturation] = rgb2hs(color);
  const phi = (hue / 360) * 2 * Math.PI;
  const sat = Math.min(saturation, 1);
  const x = Math.cos(phi) * sat;
  const y = Math.sin(phi) * sat;
  return {x, y};
};

export const getCoordFromTemperature = (temperature: number) => {
  const minKelvin = 2000;
  const maxKelvin = 10000;
  const fraction = (temperature - minKelvin) / (maxKelvin - minKelvin);
  return {x: 0, y: 2 * fraction - 1};
};
