import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';
import {useLightModalContext} from '../../../../../contexts/LightModalContext';
import {HassEntityWithService} from '@hakit/core';
import {getCoordFromColor} from '../../../../Light/LightModal/utils';
import {useEffect, useState} from 'react';

type PickerProps = {
  entity: HassEntityWithService<'light'>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
};

export function Picker(props: PickerProps) {
  const {entity, canvasRef} = props;
  const canvas = canvasRef.current;
  const {setActiveEntities, hoverEntity} = useLightModalContext();
  const [position, setPosition] = useState({x: 0, y: 0});
  const color = entity.attributes.rgb_color ?? [255, 255, 255];
  const hovered = hoverEntity === entity.entity_id;

  useEffect(() => {
    if (!entity || !canvas) return;
    const {x, y} = getCoordFromColor(color);
    setPosition({x, y});
  }, [entity, canvas]);

  return (
    <Stack
      component={motion.div}
      whileTap={{scale: 1.5, zIndex: 10}}
      whileHover={{scale: 1.2, zIndex: 10}}
      onClick={() => setActiveEntities([entity.entity_id])}
      position="absolute"
      width="32px"
      height="32px"
      top={`calc(${50 + position.y * 50}% - 12px)`}
      left={`calc(${50 + position.x * 50}% - 12px)`}
    >
      <Stack
        m="4px"
        width="24px"
        height="24px"
        borderRadius="50%"
        border={`${hovered ? '3px' : '2px'} solid black`}
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
