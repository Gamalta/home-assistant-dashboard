import {DragControls, Point} from 'framer-motion';
import {useCallback, useEffect, useState} from 'react';
import {HassEntityWithService, hsv2rgb, temperature2rgb} from '@hakit/core';
import {useLightModalContext} from '../contexts/LightModalContext';
import {getCoordFromColor, getRelativePosition} from '../utils/color';

export const useColorPicker = (
  canvas: HTMLCanvasElement | null,
  dragControls: DragControls,
  activeEntities: HassEntityWithService<'light'>[],
  mode: 'color' | 'temperature' = 'color'
) => {
  const [position, setPosition] = useState({x: 0, y: 0});
  const [color, setColor] = useState<[number, number, number]>([0, 0, 0]);
  const {entities, activeEntityIds, setActiveEntityIds, setHoverEntity} =
    useLightModalContext();

  const moveColorPicker = useCallback(
    (x: number, y: number) => {
      if (!canvas) return;
      const {clientWidth, clientHeight} = canvas;
      setPosition({x, y});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dragControls as any).componentControls.forEach((entry: any) => {
        entry.getAxisMotionValue('x').set(x * (clientWidth / 2));
        entry.getAxisMotionValue('y').set(y * (clientHeight / 2));
      });
    },
    [canvas, dragControls]
  );

  //TODO create function for update color entities.turnOn(color: color) used in onDragEnd and onClick
  // add documentation for all functions and hooks
  // test with different entities neer, far, click and drag
  // bug when drag oustide the canvas

  const onDrag = (_: unknown, info: {point: Point}) => {
    if (!canvas) return;
    const {x, y} = getRelativePosition(canvas, info.point.x, info.point.y);
    const radius = canvas.clientWidth / 2;
    const distanceFromMiddle = Math.hypot(x, y);

    if (distanceFromMiddle > 1 || distanceFromMiddle < 0) {
      const angle = Math.atan2(y, x);
      moveColorPicker(radius * Math.cos(angle), radius * Math.sin(angle));
    }
    setPosition({x, y});

    const neerEntity = getNeerEntity(x, y, entities);
    setHoverEntity(neerEntity?.entity_id);
  };

  const onDragEnd = (_: unknown, info: {point: Point}) => {
    if (!canvas) return;

    const {x, y} = getRelativePosition(canvas, info.point.x, info.point.y);
    const neerEntity = getNeerEntity(x, y, entities);
    if (neerEntity) {
      moveColorPicker(x, y);
      setActiveEntityIds(activeEntities => [
        neerEntity.entity_id,
        ...activeEntities,
      ]);
    }

    let newColor;

    switch (mode) {
      case 'color': {
        newColor = getColorFromCoord(x, y);
        setColor(newColor);
        break;
      }
      case 'temperature': {
        const temp = getTemperatureFromCoord(y);
        newColor = temperature2rgb(temp);
        break;
      }
    }
    entities
      .filter(entity => activeEntityIds.includes(entity.entity_id))
      .map(entity => entity.service.turnOn({rgb_color: newColor}));
  };

  const onClick = useCallback(
    ({clientX, clientY}: MouseEvent) => {
      const coord = getRelativePosition(canvas, clientX, clientY);
      moveColorPicker(coord.x, coord.y);
      let newColor;

      switch (mode) {
        case 'color': {
          newColor = getColorFromCoord(coord.x, coord.y);
          setColor(newColor);
          break;
        }
        case 'temperature': {
          const temp = getTemperatureFromCoord(coord.y);
          newColor = temperature2rgb(temp);
          break;
        }
      }
      entities
        .filter(entity => activeEntityIds.includes(entity.entity_id))
        .map(entity => entity.service.turnOn({rgb_color: newColor}));
    },
    [canvas, moveColorPicker]
  );

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

  const getTemperatureFromCoord = (y: number) => {
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
  }, [mode, position]);

  useEffect(() => {
    if (!canvas || !entities[0]) return;
    const color = entities[0]?.attributes.rgb_color ?? [255, 255, 255];
    const coord = getCoordFromColor(color);
    moveColorPicker(coord.x, coord.y);

    canvas.addEventListener('click', onClick);
    return () => {
      canvas.removeEventListener('click', onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, moveColorPicker, onClick]);

  return {color, onDrag, onDragEnd};
};
