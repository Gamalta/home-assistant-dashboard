import Stack from '@mui/material/Stack';
import {useCallback, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import styled from '@emotion/styled';
import {useLightModalContext} from '../../../../contexts/LightModalContext';
import {Picker} from '../components/Picker';
import {ActivePicker} from '../components/ActivePicker';
import {
  drawColorWheel,
  getColorFromCoord,
  getRelativePosition,
} from '../../../../utils/color';
import {lightHasColor} from '../../../../utils/entity/light';

export function ColorTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {entities, activeEntityIds, setActiveEntityIds} =
    useLightModalContext();
  const entitiesRef = useRef(entities);

  //TODO brightness bug
  //TODO color temp

  const generateColorWheel = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    drawColorWheel(ctx);
  }, []);

  const onClick = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!canvasRef.current) return;
    const {x, y} = getRelativePosition(
      canvasRef.current,
      event.clientX,
      event.clientY
    );
    const newColor = getColorFromCoord(x, y);

    entities
      .filter(entity => activeEntityIds.includes(entity.entity_id))
      .map(entity => {
        entity.service.turnOn({serviceData: {rgb_color: newColor}});
      });
  };

  useEffect(() => {
    generateColorWheel();
    setActiveEntityIds([entitiesRef.current[0].entity_id]);
  }, [generateColorWheel, setActiveEntityIds]);

  return (
    <Stack maxWidth="500px" minWidth="500px" p={2} alignItems="center">
      <Stack
        component={motion.div}
        position="relative"
        height="30vh"
        maxHeight="320px"
        maxWidth="320px"
        minHeight="200px"
        minWidth="200px"
      >
        <Canvas
          ref={canvasRef}
          width="400px"
          height="400px"
          onClick={onClick}
        />
        {entities
          .filter(
            entity =>
              !activeEntityIds.includes(entity.entity_id) &&
              entity.state === 'on' &&
              entity.attributes.rgb_color &&
              lightHasColor(entity)
          )
          .map(entity => (
            <Picker
              key={`color-${entity.entity_id}`}
              mode="color"
              canvasRef={canvasRef}
              entity={entity}
            />
          ))}
        <ActivePicker
          mode="color"
          canvasRef={canvasRef}
          entities={entities.filter(
            entity =>
              activeEntityIds.includes(entity.entity_id) &&
              entity.state === 'on' &&
              entity.attributes.rgb_color &&
              lightHasColor(entity)
          )}
        />
      </Stack>
    </Stack>
  );
}

const Canvas = styled.canvas`
  object-fit: contain;
  border-radius: 50%;
  cursor: pointer;
  width: 100%;
  height: 100%;
`;
