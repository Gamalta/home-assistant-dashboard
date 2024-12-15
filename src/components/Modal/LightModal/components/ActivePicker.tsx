import Stack from '@mui/material/Stack';
import {motion, useDragControls} from 'framer-motion';
import {HassEntityWithService} from '@hakit/core';
import {useColorPicker} from '../../../../hooks/useColorPicker';

type ActivePickerProps = {
  mode: 'color' | 'temperature';
  canvasRef: React.RefObject<HTMLCanvasElement>;
  entities: HassEntityWithService<'light'>[];
};

export function ActivePicker(props: ActivePickerProps) {
  const {mode, canvasRef, entities} = props;
  const dragControls = useDragControls();
  const {color, ...events} = useColorPicker(
    canvasRef.current,
    dragControls,
    mode
  );

  if (entities.length === 0) return <></>;

  return (
    <Stack
      component={motion.div}
      drag
      {...events}
      dragControls={dragControls}
      dragMomentum={false}
      whileTap={{scale: 1.5, zIndex: 10, cursor: 'grabbing'}}
      whileHover={{scale: 1.2, zIndex: 10, cursor: 'grab'}}
      position="absolute"
      top="calc(50% - 12px)"
      left="calc(50% - 12px)"
      width="32px"
      height="32px"
    >
      <Stack
        width="100%"
        height="100%"
        borderRadius="50%"
        border="2px solid black"
        boxSizing="border-box"
        boxShadow="0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.15)"
        bgcolor={`rgb(${color.join(',')})`}
        sx={{
          transform: 'rotate(45deg) translate(-50%, -50%)',
          borderBottomRightRadius: 0,
        }}
      />
    </Stack>
  );
}
