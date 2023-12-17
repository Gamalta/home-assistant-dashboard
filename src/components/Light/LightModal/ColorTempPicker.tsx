import {useRef, useCallback, useEffect, useState} from 'react';
import styled from '@emotion/styled';
import {temperature2rgb, rgb2hex, HassEntityWithService} from '@hakit/core';
import {drawColorTempWheel, getRelativePosition} from './utils';
import {Point, motion, useDragControls} from 'framer-motion';

export interface ColorTempPickerProps {
  entities: HassEntityWithService<'light'>[];
  onChangeApplied?: (kelvin: number, color: string) => void;
  onChange?: (kelvin: number, color: string) => void;
}

export function ColorTempPicker(props: ColorTempPickerProps) {
  const {entities, onChangeApplied, onChange} = props;
  const minKelvin = 2000;
  const maxKelvin = 10000;
  const [temperature, setColor] = useState(2000); //TODO
  const [position, setPosition] = useState({x: -1, y: -1});
  const dragControls = useDragControls();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCoordsFromTemperature = useCallback(
    (temperature?: number) => {
      if (!canvasRef.current) return {x: 0, y: 0};
      let y = 0;
      if (temperature === minKelvin) {
        y = -1;
      }
      if (temperature === maxKelvin) {
        y = 1;
      }
      const fraction =
        ((temperature || 0) - minKelvin) / (maxKelvin - minKelvin);
      y = 2 * fraction - 1;

      const canvas = canvasRef.current;
      const {x: canvasX, y: canvasY} = canvas.getBoundingClientRect();
      const halfWidth = canvas.clientWidth / 2;
      const halfHeight = canvas.clientHeight / 2;

      return {x: canvasX + halfWidth, y: canvasY + halfHeight + halfHeight * y};
    },
    [minKelvin, maxKelvin]
  );

  const generateColorWheel = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    drawColorTempWheel(ctx, minKelvin, maxKelvin);
  }, [minKelvin, maxKelvin]);

  const getTemperatureFromCoord = useCallback(
    (x: number, y: number): number => {
      const fraction = (y / 0.9 + 1) / 2;
      const temperature = Math.max(
        Math.min(minKelvin + fraction * (maxKelvin - minKelvin), maxKelvin),
        minKelvin
      );
      return Math.round(temperature);
    },
    [minKelvin, maxKelvin]
  );

  const onDrag = useCallback(
    (
      _: MouseEvent | TouchEvent | PointerEvent | null,
      info: {point: Point}
    ) => {
      if (!canvasRef.current) return;

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

  useEffect(() => {
    generateColorWheel();
    const pos = getCoordsFromTemperature(2000); //TODO
    console.log('set pos', pos);
    setPosition(pos);
  }, [generateColorWheel]);

  useEffect(() => {
    if (position.x === -1 || position.y === -1 || !canvasRef.current) return;

    const {x, y} = getRelativePosition(canvasRef, position.x, position.y);
    const temperature = getTemperatureFromCoord(x, y);
    setColor(temperature);
    onChange && onChange(temperature, rgb2hex(temperature2rgb(temperature)));

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
        dragControls={dragControls}
        dragMomentum={false}
        onDrag={onDrag}
        onDragEnd={() =>
          onChangeApplied &&
          onChangeApplied(temperature, rgb2hex(temperature2rgb(temperature)))
        }
        whileTap={{scale: 1.5, cursor: 'grabbing'}}
        whileHover={{scale: 1.2, cursor: 'grab'}}
        style={{
          backgroundColor: rgb2hex(temperature2rgb(temperature)),
        }}
      />
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
