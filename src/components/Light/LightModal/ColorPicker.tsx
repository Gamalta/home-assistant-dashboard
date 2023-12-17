import {useRef, useCallback, useEffect, useState} from 'react';
import styled from '@emotion/styled';
import {HassEntityWithService, useLightColor} from '@hakit/core';
import {drawColorWheel} from './utils';
import {motion} from 'framer-motion';
import {Picker} from './Picker';

export type ColorPickerProps = {
  entities: HassEntityWithService<'light'>[];
  lightColors: ReturnType<typeof useLightColor>;
  onChangeApplied?: (
    entity: HassEntityWithService<'light'>,
    color: [number, number, number]
  ) => void;
  onChange?: (
    entity: HassEntityWithService<'light'>,
    color: [number, number, number]
  ) => void;
};

export function ColorPicker(props: ColorPickerProps) {
  const {entities: entities, lightColors, onChange, onChangeApplied} = props;

  const minKelvin = 2000;
  const maxKelvin = 10000;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState({id: '', x: -1, y: -1});

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

  useEffect(() => {
    generateColorWheel();
  }, [generateColorWheel]);

  return (
    <Container>
      <Canvas
        ref={canvasRef}
        width="400px"
        height="400px"
        onClick={event => {
          if (!canvasRef.current) return;
          const eventPos = {x: event.clientX, y: event.clientY};
          setActive(prev => ({
            ...prev,
            ...eventPos,
          }));
        }}
      />
      {entities.map((entity, index) => (
        <Picker
          key={index}
          canvasRef={canvasRef}
          entity={entity}
          active={active.id === entity.entity_id}
          activePosition={{x: active.x, y: active.y}}
          lightColors={lightColors}
          onClick={() => {
            setActive({id: entity.entity_id, x: -1, y: -1});
          }}
          onChange={onChange}
          onChangeApplied={onChangeApplied}
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
