import Stack from '@mui/material/Stack';
import {useCallback, useEffect, useRef} from 'react';
import {drawColorWheel} from '../../../../Light/LightModal/utils';
import {motion} from 'framer-motion';
import styled from '@emotion/styled';
import {useLightModalContext} from '../../../../../contexts/LightModalContext';
import {Picker} from '../components/Picker';
import {ActivePicker} from '../components/ActivePicker';

export function ColorTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {entities, activeEntities, setActiveEntities} = useLightModalContext();

  const generateColorWheel = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    drawColorWheel(ctx);
  }, []);

  useEffect(() => {
    generateColorWheel();
    setActiveEntities([entities[0].entity_id]);
  }, []);

  return (
    <Stack maxWidth="500px" minWidth="500px" p={2} alignItems="center">
      <Stack
        component={motion.div}
        position="relative"
        height="45vh"
        maxHeight="320px"
        maxWidth="320px"
        minHeight="200px"
        minWidth="200px"
      >
        <Canvas ref={canvasRef} width="400px" height="400px" />
        {entities
          .filter(
            entity =>
              !activeEntities.includes(entity.entity_id) &&
              entity.state === 'on'
          )
          .map(entity => (
            <Picker
              key={entity.entity_id}
              canvasRef={canvasRef}
              entity={entity}
            />
          ))}
        <ActivePicker
          canvasRef={canvasRef}
          entities={entities.filter(
            entity =>
              activeEntities.includes(entity.entity_id) && entity.state === 'on'
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
