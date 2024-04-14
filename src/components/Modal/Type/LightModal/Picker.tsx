import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';
import {useLightModalContext} from '../../../../contexts/LightModalContext';
import {HassEntityWithService} from '@hakit/core';
import {useEffect, useRef} from 'react';
import {getCoordFromColor} from '../../../Light/LightModal/utils';

type PickerProps = {
  entity: HassEntityWithService<'light'>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
};

export function Picker(props: PickerProps) {
  const {entity, canvasRef} = props;
  const {setActiveEntities} = useLightModalContext();
  const pickerRef = useRef<HTMLDivElement>(null);
  const color = entity.attributes.rgb_color ?? [255, 255, 255];
  const canvas = canvasRef.current;
  const picker = pickerRef.current;

  useEffect(() => {
    if (!picker || !canvas) return;
    const {x, y} = getCoordFromColor(color);
    picker.style.top = `calc(${50 + y * 50}% - 12px)`;
    picker.style.left = `calc(${50 + x * 50}% - 12px)`;
  }, [canvas]);

  return (
    <Stack
      ref={pickerRef}
      component={motion.div}
      whileTap={{scale: 1.5, zIndex: 10, cursor: 'grabbing'}}
      whileHover={{scale: 1.2, zIndex: 10, cursor: 'grab'}}
      onClick={() => setActiveEntities([entity.entity_id])}
      position="absolute"
      width="32px"
      height="32px"
    >
      <Stack
        m="4px"
        width="24px"
        height="24px"
        borderRadius="50%"
        border="2px solid black"
        boxShadow="0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.15)"
        bgcolor={`rgb(${color.join(',')})`}
        sx={{
          '&:hover': {
            border: '2px solid white',
          },
        }}
      />
    </Stack>
  );
}
