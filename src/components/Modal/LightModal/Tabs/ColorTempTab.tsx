import Stack from '@mui/material/Stack';
import {useCallback, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import styled from '@emotion/styled';
import {useLightModalContext} from '../../../../contexts/LightModalContext';
import {Picker} from '../components/Picker';
import {ActivePicker} from '../components/ActivePicker';
import {
  drawColorTempWheel,
  getColorTempFromCoord,
  getRelativePosition,
} from '../../../../utils/color';
import {lightHasColorTemp} from '../../../../utils/entity/light';

export const MIN_KELVIN = 2000;
export const MAX_KELVIN = 10000;

export function ColorTempTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {entities, activeEntityIds, setActiveEntityIds} =
    useLightModalContext();
  const entitiesRef = useRef(entities);

  const generateColorTempWheel = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    drawColorTempWheel(ctx);
  }, []);

  const onClick = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!canvasRef.current) return;
    const {x, y} = getRelativePosition(
      canvasRef.current,
      event.clientX,
      event.clientY
    );
    const newColor = getColorTempFromCoord(x, y);

    entities
      .filter(entity => activeEntityIds.includes(entity.entity_id))
      .map(entity => {
        entity.service.turnOn({
          serviceData: {
            color_temp_kelvin: Math.round(newColor),
          } as object, // types object for bypass type missing on hakit
        });
      });
  };

  useEffect(() => {
    generateColorTempWheel();
    setActiveEntityIds([entitiesRef.current[0].entity_id]);
  }, [generateColorTempWheel, setActiveEntityIds]);

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
        borderRadius="50%"
        border="3px solid"
        borderColor="divider"
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
              entity.attributes.color_temp_kelvin &&
              lightHasColorTemp(entity)
          )
          .map(entity => (
            <Picker
              key={`temp-${entity.entity_id}`}
              mode="temperature"
              canvasRef={canvasRef}
              entity={entity}
            />
          ))}
        <ActivePicker
          mode="temperature"
          canvasRef={canvasRef}
          entities={entities.filter(
            entity =>
              activeEntityIds.includes(entity.entity_id) &&
              entity.state === 'on' &&
              entity.attributes.color_temp_kelvin &&
              lightHasColorTemp(entity)
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
