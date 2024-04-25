import {DragControls, Point} from 'framer-motion';
import {
  getCoordFromColor,
  getRelativePosition,
} from '../components/Light/LightModal/utils';
import {useEffect, useState} from 'react';
import {HassEntityWithService, hsv2rgb, temperature2rgb} from '@hakit/core';
import {useLightModalContext} from '../contexts/LightModalContext';

export const useColorPicker = (
  canvas: HTMLCanvasElement | null,
  dragControls: DragControls,
  entities: HassEntityWithService<'light'>[],
  mode: 'color' | 'temperature' = 'color'
) => {
  const [position, setPosition] = useState({x: 0, y: 0});
  const [color, setColor] = useState<[number, number, number]>([0, 0, 0]);
  const {
    entities: inactiveEntites,
    activeEntities,
    setActiveEntities,
    setHoverEntity,
  } = useLightModalContext();

  const handleMove = (_: unknown, info: {point: Point}) => {
    if (!canvas) return;
    const {x, y} = getRelativePosition(canvas, info.point.x, info.point.y);
    const radius = canvas.clientWidth / 2;
    const distanceFromMiddle = Math.hypot(x, y);

    if (distanceFromMiddle > 1 || distanceFromMiddle < 0) {
      const angle = Math.atan2(y, x);
      movePicker(radius * Math.cos(angle), radius * Math.sin(angle));
    }
    setPosition({x, y});

    const neerEntity = getNeerEntity({x, y}, inactiveEntites);
    setHoverEntity(neerEntity?.entity_id);
  };

  const onDragEnd = (_: unknown, info: {point: Point}) => {
    if (!canvas) return;
    const {x, y} = getRelativePosition(canvas, info.point.x, info.point.y);
    const neerEntity = getNeerEntity({x, y}, inactiveEntites);
    if (!neerEntity) return;
    setActiveEntities(activeEntities => [
      neerEntity.entity_id,
      ...activeEntities,
    ]);
  };

  const getNeerEntity = (
    {x, y}: {x: number; y: number},
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

  const movePicker = (x: number, y: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (dragControls as any).componentControls.forEach((entry: any) => {
      entry.getAxisMotionValue('x').set(x);
      entry.getAxisMotionValue('y').set(y);
    });
  };

  const getColorFromCoord = (x: number, y: number) => {
    const hue = Math.round((Math.atan2(y, x) / (2 * Math.PI)) * 360) % 360;
    const saturation = Math.round(Math.min(Math.hypot(x, y), 1) * 100) / 100;
    return hsv2rgb([hue, saturation, 255]);
  };

  const getTemperatureFromCoord = (y: number): number => {
    const minKelvin = 2000;
    const maxKelvin = 10000;
    const fraction = (y / 0.9 + 1) / 2;
    const temperature = Math.max(
      Math.min(minKelvin + fraction * (maxKelvin - minKelvin), maxKelvin),
      minKelvin
    );
    return Math.round(temperature);
  };

  useEffect(() => {
    switch (mode) {
      case 'color': {
        const newColor = getColorFromCoord(position.x, position.y);
        setColor(newColor);
        break;
      }
      case 'temperature': {
        const temp = getTemperatureFromCoord(position.y);
        setColor(temperature2rgb(temp));
        break;
      }
    }
  }, [position]);

  useEffect(() => {
    if (!entities[0] || !canvas) return;
    const color = entities[0].attributes.rgb_color ?? [255, 255, 255];

    const moveColorPicker = ({x, y}: {x: number; y: number}) => {
      const {clientWidth, clientHeight} = canvas;
      setPosition({x, y});
      movePicker(x * (clientWidth / 2), y * (clientHeight / 2));
    };

    const coord = getCoordFromColor(color);
    moveColorPicker(coord);

    const onClick = ({clientX, clientY}: MouseEvent) => {
      const coord = getRelativePosition(canvas, clientX, clientY);
      moveColorPicker(coord);
      entities
        .filter(entity => activeEntities.includes(entity.entity_id))
        .map(entity => entity.service.turnOn({rgb_color: color}));
    };

    canvas.addEventListener('click', onClick);

    return () => {
      canvas.removeEventListener('click', onClick);
    };
  }, [entities, canvas]);

  return {
    color,
    onDrag: handleMove,
    ondragEnd: onDragEnd,
  };
};
