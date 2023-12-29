import styled from '@emotion/styled';
import {
  HassEntityWithService,
  hsv2rgb,
  rgb2hs,
  useLightColor,
} from '@hakit/core';
import {Point, motion, useDragControls} from 'framer-motion';
import {RefObject, useCallback, useEffect, useState} from 'react';
import {adjustRgb, getHSLColorFromCoord, getRelativePosition} from './utils';

export type PickerProps = {
  canvasRef: RefObject<HTMLCanvasElement>;
  entities: HassEntityWithService<'light'>[];
  lightColors: ReturnType<typeof useLightColor>;
  onClick?: (entities: HassEntityWithService<'light'>[]) => void;
  onChangeApplied?: (
    entities: HassEntityWithService<'light'>[],
    color: [number, number, number]
  ) => void;
  onChange?: (
    entities: HassEntityWithService<'light'>[],
    color: [number, number, number]
  ) => void;
};

export function Picker(props: PickerProps) {
  const {canvasRef, entities, lightColors, onClick, onChange, onChangeApplied} =
    props;
  const [color, setColor] = useState<[number, number, number]>(
    entities[0]?.attributes.rgb_color ?? [255, 255, 255]
  );
  const [position, setPosition] = useState({x: -1, y: -1});
  const dragControls = useDragControls();

  const getCoordFromHSLColor = useCallback(
    ([hue, saturation]: [number, number]) => {
      if (!canvasRef.current) return {x: 0, y: 0};
      const phi = (hue / 360) * 2 * Math.PI;
      const sat = Math.min(saturation, 1);
      const x = Math.cos(phi) * sat;
      const y = Math.sin(phi) * sat;
      const canvas = canvasRef.current;
      const {x: canvasX, y: canvasY} = canvas.getBoundingClientRect();
      const halfWidth = canvas.clientWidth / 2;
      const halfHeight = canvas.clientHeight / 2;

      return {
        x: canvasX + halfWidth + halfWidth * x,
        y: canvasY + halfHeight + halfHeight * y,
      };
    },
    []
  );

  const onDrag = useCallback(
    (
      _: MouseEvent | TouchEvent | PointerEvent | null,
      info: {point: Point}
    ) => {
      if (!canvasRef.current) return;
      onClick && onClick(entities);

      const {x, y} = getRelativePosition(canvasRef, info.point.x, info.point.y);
      const radius = canvasRef.current.clientWidth / 2;
      const distanceFromMiddle = Math.hypot(x, y);

      if (distanceFromMiddle > 1 || distanceFromMiddle < 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (dragControls as any).componentControls.forEach((entry: any) => {
          const angle = Math.atan2(y, x);
          entry.getAxisMotionValue('x').set(radius * Math.cos(angle));
          entry.getAxisMotionValue('y').set(radius * Math.sin(angle));
        });
      }
      setPosition(info.point);
    },
    []
  );

  const getColorFromCoord = useCallback(
    (x: number, y: number) => getHSLColorFromCoord(x, y),
    []
  );

  useEffect(() => {
    if (position.x === -1 || position.y === -1 || !canvasRef.current) return;

    const {x, y} = getRelativePosition(canvasRef, position.x, position.y);
    const {hue, saturation} = getColorFromCoord(x, y);

    const color = adjustRgb(
      hsv2rgb([hue, saturation, lightColors.colorBrightness ?? 255]),
      lightColors.white,
      lightColors.coolWhite,
      lightColors.warmWhite
    );
    setColor(color);
    onChange && onChange(entities, color);

    const {clientWidth, clientHeight} = canvasRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (dragControls as any).componentControls.forEach((entry: any) => {
      entry.getAxisMotionValue('x').set(x * (clientWidth / 2));
      entry.getAxisMotionValue('y').set(y * (clientHeight / 2));
    });
  }, [position]);

  useEffect(() => {
    setPosition(getCoordFromHSLColor(rgb2hs(color)));
  }, []);

  return (
    <StyledPicker
      drag
      dragControls={dragControls}
      dragMomentum={false}
      onClick={() => onClick && onClick(entities)}
      onDrag={onDrag}
      onDragEnd={() => onChangeApplied && onChangeApplied(entities, color)}
      whileTap={{scale: 1.5, cursor: 'grabbing'}}
      whileHover={{scale: 1.2, cursor: 'grab'}}
      style={{
        backgroundColor: `rgb(${color.join(',')})`,
        borderColor: 'white',
      }}
    />
  );
}

const StyledPicker = styled(motion.div)`
  position: absolute;
  top: calc(50% - 12px);
  left: calc(50% - 12px);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.15);
`;
