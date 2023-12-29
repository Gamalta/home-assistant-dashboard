import {useRef, useCallback, useEffect, useState} from 'react';
import styled from '@emotion/styled';
import {HassEntityWithService, useLightColor} from '@hakit/core';
import {drawColorWheel, getRelativePosition} from './utils';
import {Point, motion, useDragControls} from 'framer-motion';
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
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [activePos, setActivePos] = useState({x: -1, y: -1});

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
          //move active to pos
        }}
      />
      {entities
        .filter(entity => !activeIds.includes(entity.entity_id))
        .map((entity, index) => (
          <Picker
            key={index}
            canvasRef={canvasRef}
            entities={[entity]}
            lightColors={lightColors}
            onClick={() => {
              setActiveIds(prev => [...prev, entity.entity_id]);
            }}
            onChange={onChange}
            onChangeApplied={onChangeApplied}
          />
        ))}
      <Picker
        canvasRef={canvasRef}
        entities={entities.filter(entity =>
          activeIds.includes(entity.entity_id)
        )}
        lightColors={lightColors}
        onClick={() => {
          // setActiveIds(prev => [...prev, entity.entity_id]);
        }}
        onChange={onChange}
        onChangeApplied={onChangeApplied}
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

const Canvas = styled.canvas`
  object-fit: contain;
  border-radius: 50%;
  cursor: pointer;
  width: 100%;
  height: 100%;
`;
