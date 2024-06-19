import {DragControls, Point} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';
import {HassEntityWithService, hsv2rgb, rgb2hs} from '@hakit/core';
import {useLightModalContext} from '../contexts/LightModalContext';
import {getRelativePosition} from '../utils/color';

type Mode = 'color' | 'temperature';
type UseColor<T extends Mode> = T extends 'color'
  ? [number, number, number]
  : number;

export const useColorPicker = <T extends Mode>(
  canvas: HTMLCanvasElement | null,
  dragControls: DragControls,
  type: T
): UseColor<T> => {
  const [color, setColor] = useState<UseColor<T>>(
    (type === 'color' ? [0, 0, 0] : 0) as UseColor<T>
  );
  //const [color, setColor] = useState<[number, number, number]>([0, 0, 0]);
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
    const newColor = getColorFromCoordWheel<T>(x, y);

    moveDragControls(dragControls, x * radius, y * radius);
    setColor(newColor);

    entities
      .filter(entity => activeEntityIdsRef.current.includes(entity.entity_id))
      .map(entity => entity.service.turnOn({rgb_color: newColor}));
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

    const newColor = getColorFromCoordWheel<T>(x, y);
    setColor(newColor);

    const neerEntity = getNeerEntity(x, y, entities);
    setHoverEntity(neerEntity?.entity_id);
  };

  const onDragEnd = (_: unknown, info: {point: Point}) => {
    if (!canvas) return;
    const {x, y} = getRelativePosition(canvas, info.point.x, info.point.y);
    const newColor = getColorFromCoordWheel<T>(x, y);
    setColor(newColor);

    if (hoverEntity) {
      setActiveEntityIds(activeEntities => [hoverEntity, ...activeEntities]);
    }

    entities
      .filter(entity => activeEntityIds.includes(entity.entity_id))
      .map(entity => entity.service.turnOn({rgb_color: newColor}));
  };

  const activeEntityState = entities.find(entity =>
    activeEntityIds.includes(entity.entity_id)
  )?.state;

  useEffect(() => {
    if (!canvas || !entities[0]) return;
    const entity =
      entities.find(entity => activeEntityIds.includes(entity.entity_id)) ??
      entities[0];
    const newColor =
      type === 'color'
        ? entity.attributes.rgb_color ?? [255, 255, 255]
        : entity.attributes.color_temp ?? 0;
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

  const getColorFromCoordWheel = <T extends Mode>(
    x: number,
    y: number
  ): UseColor<T> => {
    switch (type) {
      case 'color':
        return getColorFromCoord(x, y) as UseColor<T>;
      case 'temperature':
        return getTemperatureFromCoord(x, y) as UseColor<T>;
      default:
        return 0 as UseColor<T>;
    }
  };

  const getCoordFromColorWheel = (color: UseColor<T>) => {
    switch (type) {
      case 'color':
        return getCoordFromColor(color as [number, number, number]);
      case 'temperature':
        return getCoordFromTemperature(color as number);
      default:
        return {x: 0, y: 0};
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
      const coord = getCoordFromColorWheel(entity.custom.color);
      const distance = Math.hypot(coord.x - x, coord.y - y);
      if (distance < 0.3 && distance < bestDistance) {
        bestDistance = distance;
        neerEntity = entity;
      }
    });
    return neerEntity;
  };

  return {color, onDrag, onDragEnd};
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

export const getTemperatureFromCoord = (x: number, y: number) => {
  const temp = Math.round((Math.atan2(y, x) / (2 * Math.PI)) * 100) % 100;
  return temp;
};

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
