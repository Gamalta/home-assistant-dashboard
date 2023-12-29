import {useRef, useCallback, useEffect, MouseEventHandler} from 'react';
import styled from '@emotion/styled';
import {HassEntityWithService, hsv2rgb, useLightColor} from '@hakit/core';
import {
  adjustRgb,
  drawColorWheel,
  getHSLColorFromCoord,
  getRelativePosition,
} from './utils';
import {motion} from 'framer-motion';
import {Picker} from './Picker';

export type ColorPickerProps = {
  entities: HassEntityWithService<'light'>[];
  lightColors: ReturnType<typeof useLightColor>;
  onClick?: (color: [number, number, number]) => void;
  onEntitiesClick?: (entities: HassEntityWithService<'light'>[]) => void;
  onEntitiesChange?: (
    entities: HassEntityWithService<'light'>[],
    color: [number, number, number]
  ) => void;
  onEntitiesChangeApplied?: (
    entities: HassEntityWithService<'light'>[],
    color: [number, number, number]
  ) => void;
};

export function ColorPicker(props: ColorPickerProps) {
  const {
    entities: entities,
    lightColors,
    onClick: onCanvasClick,
    onEntitiesClick,
    onEntitiesChange,
    onEntitiesChangeApplied,
  } = props;

  const minKelvin = 2000;
  const maxKelvin = 10000;

  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const getColorFromCoord = useCallback(
    (x: number, y: number) => getHSLColorFromCoord(x, y),
    []
  );

  useEffect(() => {
    generateColorWheel();
  }, [generateColorWheel]);

  const onClick: MouseEventHandler<HTMLCanvasElement> = useCallback(event => {
    if (!canvasRef.current) return;

    const {x, y} = getRelativePosition(canvasRef, event.clientX, event.clientY);
    const {hue, saturation} = getColorFromCoord(x, y);
    const color = adjustRgb(
      hsv2rgb([hue, saturation, lightColors.colorBrightness ?? 255]),
      lightColors.white,
      lightColors.coolWhite,
      lightColors.warmWhite
    );
    onCanvasClick && onCanvasClick(color);
  }, []);

  return (
    <Container>
      <Canvas ref={canvasRef} width="400px" height="400px" onClick={onClick} />
      {entities.map((entity, index) => (
        <Picker
          key={index}
          canvasRef={canvasRef}
          entities={[entity]}
          lightColors={lightColors}
          onClick={onEntitiesClick}
          onChange={onEntitiesChange}
          onChangeApplied={onEntitiesChangeApplied}
        />
      ))}
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

const Canvas = styled.canvas`
  object-fit: contain;
  border-radius: 50%;
  cursor: pointer;
  width: 100%;
  height: 100%;
`;
