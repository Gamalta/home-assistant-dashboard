import Stack from '@mui/material/Stack';
import {useCallback, useEffect, useMemo, useRef} from 'react';
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

export function ColorTempTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {entities, activeEntityIds} = useLightModalContext();
  const entitiesMaxSupportedKelvin = useMemo(
    () =>
      Math.max(
        0,
        ...entities
          .map(entity => entity.attributes.max_color_temp_kelvin)
          .filter(temp => temp !== undefined)
      ),
    [entities]
  );
  const entitiesMinSupportedKelvin = useMemo(
    () =>
      Math.max(
        0,
        ...entities
          .map(entity => entity.attributes.min_color_temp_kelvin)
          .filter(temp => temp !== undefined)
      ),
    [entities]
  );

  const generateColorTempWheel = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    drawColorTempWheel(
      ctx,
      entitiesMinSupportedKelvin,
      entitiesMaxSupportedKelvin
    );
  }, [entitiesMinSupportedKelvin, entitiesMaxSupportedKelvin]);

  const onClick = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!canvasRef.current) return;
    const {x, y} = getRelativePosition(
      canvasRef.current,
      event.clientX,
      event.clientY
    );
    const newColor = getColorTempFromCoord(
      x,
      y,
      entitiesMinSupportedKelvin,
      entitiesMaxSupportedKelvin
    );

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
  }, [generateColorTempWheel]);

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
          minKelvin={entitiesMinSupportedKelvin}
          maxKelvin={entitiesMaxSupportedKelvin}
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
