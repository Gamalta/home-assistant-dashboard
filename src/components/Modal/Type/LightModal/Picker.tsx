import Stack from '@mui/material/Stack';
import {motion, useDragControls} from 'framer-motion';

export function Picker() {
  const dragControls = useDragControls();
  return (
    <Stack
      component={motion.div}
      drag
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
        m="4px"
        width="24px"
        height="24px"
        borderRadius="50%"
        border="2px solid black"
        boxShadow="0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.15)"
        //backgroundColor: `rgb(${color.join(',')})`,
        sx={{
          '&:hover': {
            border: '2px solid white',
          },
        }}
      />
    </Stack>
  );
}
