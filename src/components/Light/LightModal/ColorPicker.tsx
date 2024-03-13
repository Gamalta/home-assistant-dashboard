import {useRef, useCallback, useEffect} from 'react';
import styled from '@emotion/styled';
import {
  EntityName,
  FilterByDomain,
  HassEntityWithService,
  useLightColor,
} from '@hakit/core';
import {drawColorWheel} from './utils';
import {motion} from 'framer-motion';
import {Picker} from './Picker';

export type ColorPickerProps = {
  entities: FilterByDomain<EntityName, 'light'>[];
  hoverEntities: FilterByDomain<EntityName, 'light'>[];
  activeEntities: FilterByDomain<EntityName, 'light'>[];
  lightColors: ReturnType<typeof useLightColor>;
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
    entities,
    hoverEntities,
    activeEntities,
    lightColors,
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

  useEffect(() => {
    generateColorWheel();
  }, [generateColorWheel]);

  //let renderActive = false;

  return (
    <Container>
      <Canvas ref={canvasRef} width="400px" height="400px" />
      {entities.map(entity => {
        const active = activeEntities.includes(entity);
        //if (!renderActive) renderActive = true;

        return (
          <Picker
            key={entity}
            canvasRef={canvasRef}
            entities={[entity]}
            hovered={hoverEntities.includes(entity)}
            lightColors={lightColors}
            onClick={onEntitiesClick}
            onChange={onEntitiesChange}
            onChangeApplied={onEntitiesChangeApplied}
            active={active}
          />
        );
      })}
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
