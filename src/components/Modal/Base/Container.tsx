import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';
import {ReactNode} from 'react';

type ContainerProps = {
  id?: string;
  children: ReactNode;
};

export function Container(props: ContainerProps) {
  const {id, children} = props;

  return (
    <Stack
      component={motion.div}
      transition={{
        duration: 1,
        type: 'spring',
        damping: 7.5,
        mass: 0.55,
        stiffness: 100,
      }}
      transformTemplate={(_, generated) => `translate(-50%, -50%) ${generated}`}
      layoutId={id}
      spacing={2}
      sx={{
        position: 'absolute',
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
        borderRadius: 1,
        zIndex: 100,
        overflow: 'hidden',
        p: 2,
        top: '50%',
        left: '50%',
        maxHeight: 'calc(100% - 4rem)',
        alignItems: 'stretch',
        boxShadow: '0px 0px 10px hsla(200, calc(50% * 0.8), 3%, 0.6)',
      }}
    >
      {children}
    </Stack>
  );
}
