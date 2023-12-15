import {useRef, useCallback, useEffect, useState} from 'react';
import styled from '@emotion/styled';
import {hsv2rgb, rgb2hex, rgb2hs, useLightColor} from '@hakit/core';
import {adjustRgb, drawColorWheel} from './utils';
import {Point, motion, useDragControls} from 'framer-motion';

export interface ColorPickerProps {
  defaultColor: [number, number, number];
  minKelvin?: number;
  maxKelvin?: number;
  lightColors: ReturnType<typeof useLightColor>;
  onChangeApplied?: (colors: string) => void;
  onChange?: (color: string) => void;
}
export function ColorPicker(props: ColorPickerProps) {
  const {
    defaultColor,
    minKelvin,
    maxKelvin,
    lightColors,
    onChange,
    onChangeApplied,
  } = props;

  const [color, setColor] = useState<[number, number, number]>(defaultColor);
  const [position, setPosition] = useState<{
    x: number;
    y: number;
  }>({x: -1, y: -1});
  const dragControls = useDragControls();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

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

  const generateColorWheel = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    drawColorWheel(
      ctx,
      lightColors.colorBrightness,
      lightColors.white,
      lightColors.coolWhite,
      lightColors.warmWhite,
      minKelvin,
      maxKelvin
    );
  }, [
    lightColors.colorBrightness,
    lightColors.white,
    lightColors.coolWhite,
    lightColors.warmWhite,
    minKelvin,
    maxKelvin,
  ]);

  const getHSLColorFromCoord = useCallback((x: number, y: number) => {
    const hue = Math.round((Math.atan2(y, x) / (2 * Math.PI)) * 360) % 360;
    const saturation =
      Math.round(Math.min(Math.sqrt(x * x + y * y), 1) * 100) / 100;
    return {hue, saturation};
  }, []);

  const getRelativePosition = useCallback((x: number, y: number) => {
    if (!canvasRef.current) return {x: 0, y: 0};
    const canvas = canvasRef.current;
    const {x: canvasX, y: canvasY} = canvas.getBoundingClientRect();
    const xRel = (2 * (x - canvasX)) / canvas.clientWidth - 1;
    const yRel = (2 * (y - canvasY)) / canvas.clientHeight - 1;
    return {x: xRel, y: yRel};
  }, []);

  const onDrag = useCallback(
    (
      _: MouseEvent | TouchEvent | PointerEvent | null,
      info: {point: Point}
    ) => {
      if (!canvasRef.current) return;

      const {x, y} = getRelativePosition(info.point.x, info.point.y);
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

  useEffect(() => {
    generateColorWheel();
    console.log('entree', lightColors.hs, rgb2hs(defaultColor));
    const pos = getCoordFromHSLColor(lightColors.hs ?? rgb2hs(defaultColor));
    console.log('pos', pos);
    setPosition(pos);
  }, [generateColorWheel]);

  useEffect(() => {
    if (position.x === -1 || position.y === -1 || !canvasRef.current) return;

    const {x, y} = getRelativePosition(position.x, position.y);
    const {hue, saturation} = getHSLColorFromCoord(x, y);

    const color = adjustRgb(
      hsv2rgb([hue, saturation, lightColors.colorBrightness ?? 255]),
      lightColors.white,
      lightColors.coolWhite,
      lightColors.warmWhite
    );
    setColor(color);
    onChange && onChange(rgb2hex(color));

    const {clientWidth, clientHeight} = canvasRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (dragControls as any).componentControls.forEach((entry: any) => {
      entry.getAxisMotionValue('x').set(x * (clientWidth / 2));
      entry.getAxisMotionValue('y').set(y * (clientHeight / 2));
    });
  }, [position]);

  return (
    <Container>
      <Canvas
        ref={canvasRef}
        width="400px"
        height="400px"
        onClick={event => {
          if (!canvasRef.current) return;
          const eventPos = {x: event.clientX, y: event.clientY};
          setPosition(eventPos);
        }}
      />
      <Picker
        drag
        ref={elementRef}
        dragControls={dragControls}
        dragMomentum={false}
        onDrag={onDrag}
        onDragEnd={() => onChangeApplied && onChangeApplied(rgb2hex(color))}
        whileTap={{scale: 1.5}}
        whileHover={{scale: 1.2}}
        style={{
          backgroundColor: `rgb(${color.join(',')})`,
        }}
      />
      <>
        x: {position.x} | y: {position.y}
      </>
    </Container>
  );
}

const Container = styled(motion.div)`
  position: relative;
  height: '45vh';
  max-height: 320px;
  max-width: 320px;
  min-height: 200px;
  min-width: 200px;
`;

const Picker = styled(motion.div)`
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

const Canvas = styled.canvas`
  object-fit: contain;
  border-radius: 50%;
  cursor: pointer;
  width: 100%;
  height: 100%;
`;
