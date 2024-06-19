import {DragControls, Point} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';
import {HassEntityWithService, hsv2rgb} from '@hakit/core';
import {useLightModalContext} from '../contexts/LightModalContext';
import {getCoordFromColor, getRelativePosition} from '../utils/color';

export const useColorPicker = (
  canvas: HTMLCanvasElement | null,
  dragControls: DragControls
  //mode: 'color' | 'temperature' = 'color'
) => {
  const [color, setColor] = useState<[number, number, number]>([0, 0, 0]);
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
    const newColor = getColorFromCoord(x, y);

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

    const newColor = getColorFromCoord(x, y);
    setColor(newColor);

    const neerEntity = getNeerEntity(x, y, entities);
    setHoverEntity(neerEntity?.entity_id);
  };

  const onDragEnd = (_: unknown, info: {point: Point}) => {
    if (!canvas) return;
    const {x, y} = getRelativePosition(canvas, info.point.x, info.point.y);
    const newColor = getColorFromCoord(x, y);
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
    const newColor = entities[0]?.attributes.rgb_color ?? [255, 255, 255];
    const {x, y} = getCoordFromColor(newColor);
    const radius = canvas.clientWidth / 2;
    moveDragControls(dragControls, x * radius, y * radius);
    setColor(newColor);

    canvas.addEventListener('click', onClick);
    return () => {
      canvas.removeEventListener('click', onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, activeEntityState]);

  return {color, onDrag, onDragEnd};
};

const moveDragControls = (dragControls: DragControls, x: number, y: number) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dragControls as any).componentControls.forEach((entry: any) => {
    entry.getAxisMotionValue('x').set(x);
    entry.getAxisMotionValue('y').set(y);
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
    const coord = getCoordFromColor(entity.custom.color);
    const distance = Math.hypot(coord.x - x, coord.y - y);
    if (distance < 0.3 && distance < bestDistance) {
      bestDistance = distance;
      neerEntity = entity;
    }
  });
  return neerEntity;
};

const getColorFromCoord = (x: number, y: number) => {
  const hue = Math.round((Math.atan2(y, x) / (2 * Math.PI)) * 360) % 360;
  const saturation = Math.round(Math.min(Math.hypot(x, y), 1) * 100) / 100;
  return hsv2rgb([hue, saturation, 255]);
};
